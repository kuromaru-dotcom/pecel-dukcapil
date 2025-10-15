import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db"; // Use the pg pool configured for Supabase
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { errorHandler, requestLogger } from "./middleware";

const PgSession = connectPgSimple(session);

let appPromise: Promise<express.Express> | null = null;

export async function getApp(): Promise<express.Express> {
  if (appPromise) {
    return appPromise;
  }

  appPromise = (async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Setup session with database store using Supabase-compatible pool
    
    app.use(
      session({
        store: new PgSession({
          pool,
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'pecel-dukcapil-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production (HTTPS)
          sameSite: 'lax'
        }
      })
    );

    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      });

      next();
    });

    await registerRoutes(app);

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // In production, serve static files
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }

    return app;
  })();

  return appPromise;
}
