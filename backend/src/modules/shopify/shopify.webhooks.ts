import { Request, Response } from 'express';
import { verifyShopifyWebhook } from '../../utils/crypto.utils';
import { processOrderPaid } from '../../services/commission.service';
import prisma from '../../config/database';
import { decrypt } from '../../utils/crypto.utils';

// ─────────────────────────────────────────────────
// Shopify Webhooks Controller
// ─────────────────────────────────────────────────

/**
 * Handle incoming webhooks from Shopify
 * Requires raw body for HMAC verification
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const hmac = req.headers['x-shopify-hmac-sha256'] as string;
    const topic = req.headers['x-shopify-topic'] as string;
    
    // We need the raw buffer for HMAC verification. We'll set this up in app.ts using express.raw()
    const rawBody = (req as any).rawBody as Buffer;

    if (!hmac || !topic || !rawBody) {
      res.status(400).send('Missing webhook headers or body');
      return;
    }

    // Get Webhook Secret from DB or Env
    const settings = await prisma.shopifySettings.findFirst({
      where: { isActive: true },
    });
    
    const secret = settings?.webhookSecret 
      ? decrypt(settings.webhookSecret) 
      : process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('❌ Shopify Webhook Secret not configured');
      res.status(500).send('Webhook secret not configured');
      return;
    }

    // Verify HMAC Signature
    const isValid = verifyShopifyWebhook(rawBody, hmac, secret);
    if (!isValid) {
      console.error('❌ Invalid Shopify Webhook Signature');
      res.status(401).send('Invalid signature');
      return;
    }

    // Parse payload
    const payload = JSON.parse(rawBody.toString('utf8'));

    // Always return 200 OK immediately to Shopify, process asynchronously
    res.status(200).send('Webhook received');

    // Process based on topic
    switch (topic) {
      case 'orders/paid':
        await processOrderPaid(payload);
        break;
      
      // Add more webhook topics if needed (e.g. orders/cancelled to reverse commission)
      case 'orders/cancelled':
        console.log(`Order ${payload.id} cancelled. Reversing commission logic can be implemented here.`);
        break;
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

  } catch (error) {
    console.error('Error handling webhook:', error);
    // Don't send 500 back to shopify if we already sent 200
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
};
