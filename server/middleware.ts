import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

/**
 * Middleware to validate request body with Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validasi gagal",
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware to validate query parameters with Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Parameter tidak valid",
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error for debugging
  console.error('[ERROR]', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validasi gagal",
      details: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: "Tidak terautentikasi",
      code: "UNAUTHORIZED"
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: "Akses ditolak",
      code: "FORBIDDEN"
    });
  }

  // Database errors
  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({
      error: "Data sudah ada",
      details: "Data yang Anda masukkan sudah terdaftar",
      code: "DUPLICATE_ENTRY"
    });
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      error: "Referensi tidak valid",
      details: "Data yang direferensikan tidak ditemukan",
      code: "FOREIGN_KEY_VIOLATION"
    });
  }

  // Default to 500 Internal Server Error
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? "Terjadi kesalahan pada server" 
    : err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
    code: err.code || "INTERNAL_ERROR"
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      console.error('[REQUEST ERROR]', logData);
    } else if (res.statusCode >= 400) {
      console.warn('[REQUEST WARNING]', logData);
    } else {
      console.log('[REQUEST]', logData);
    }
  });
  
  next();
}
