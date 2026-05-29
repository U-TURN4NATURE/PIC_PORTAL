import { Router } from 'express';
import { handleWebhook } from './shopify.webhooks';
import { webhookLimiter } from '../../middleware/rate-limit.middleware';
import express from 'express';

const router = Router();

// Webhook endpoint needs raw body parser for HMAC verification
// We apply express.raw() locally for this specific route
router.post(
  '/',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Save the raw body buffer on the request object for HMAC
    (req as any).rawBody = req.body;
    next();
  },
  handleWebhook
);

export default router;
