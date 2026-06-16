import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.utils';
import { errorResponse } from '../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Extend Express types to include our JWT payload
// Passport requires Express.User to be augmented; we make it our JWTPayload
// ─────────────────────────────────────────────────

declare global {
  namespace Express {
    interface User extends JWTPayload {}
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware: Verify JWT from HTTP-only cookie or Authorization header
 */
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from cookie or Authorization header
    let token: string | undefined;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json(errorResponse('Not authenticated. Please login.'));
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json(errorResponse('Invalid or expired token. Please login again.'));
  }
};

/**
 * Middleware: Restrict to PIC role only
 */
export const restrictToPIC = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'PIC') {
    res.status(403).json(errorResponse('Access denied. PIC role required.'));
    return;
  }
  next();
};

/**
 * Middleware: Restrict to Admin role only
 */
export const restrictToAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json(errorResponse('Access denied. Admin role required.'));
    return;
  }
  next();
};
