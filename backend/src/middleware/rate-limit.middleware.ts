import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Rate Limiting Configurations
// ─────────────────────────────────────────────────

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 min
const maxGeneral = parseInt(process.env.RATE_LIMIT_MAX || '100');
const maxAuth = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10');

/**
 * General API rate limiter — 100 requests / 15 min
 */
export const generalLimiter = rateLimit({
  windowMs,
  max: maxGeneral,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('Too many requests. Please try again later.'));
  },
});

/**
 * Strict auth rate limiter — 10 requests / 15 min
 * Applied to /login, /register, /forgot-password endpoints
 */
export const authLimiter = rateLimit({
  windowMs,
  max: maxAuth,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('Too many authentication attempts. Please wait 15 minutes.'));
  },
});

/**
 * Webhook limiter — allows higher throughput for Shopify webhooks
 */
export const webhookLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
