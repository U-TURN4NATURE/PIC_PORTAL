import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { errorResponse } from '../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Zod Validation Middleware
// ─────────────────────────────────────────────────

/**
 * Validate request body, query, or params using a Zod schema
 */
export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.slice(1).join('.'), // remove 'body'/'query'/'params' prefix
          message: e.message,
        }));
        res.status(400).json(errorResponse('Validation failed', errors));
        return;
      }
      next(error);
    }
  };
