import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.session || !req.session.userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  };
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    username: string;
    userRole: string;
  }
}
