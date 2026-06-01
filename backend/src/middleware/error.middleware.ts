import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Global Error Handler Middleware
// ─────────────────────────────────────────────────

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Create a structured operational error
 */
export const createError = (message: string, statusCode = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Global error handler — must be last middleware registered
 */
export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    console.error('❌ Error:', message);
  }

  res.status(statusCode).json(
    errorResponse(
      message,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
};

/**
 * Catch-all for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`));
};
