import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

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

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[ERROR]', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

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

  if (err.code === '23505') {
    return res.status(409).json({
      error: "Data sudah ada",
      details: "Data yang Anda masukkan sudah terdaftar",
      code: "DUPLICATE_ENTRY"
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: "Referensi tidak valid",
      details: "Data yang direferensikan tidak ditemukan",
      code: "FOREIGN_KEY_VIOLATION"
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? "Terjadi kesalahan pada server" 
    : err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
    code: err.code || "INTERNAL_ERROR"
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    };
    
    if (res.statusCode >= 500) {
      console.error('[REQUEST ERROR]', logData);
    } else if (res.statusCode >= 400) {
      console.warn('[REQUEST WARNING]', logData);
    }
  });
  
  next();
}
