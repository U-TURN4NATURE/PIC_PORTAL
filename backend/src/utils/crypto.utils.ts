import CryptoJS from 'crypto-js';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_key_change_in_production_!!';

// ─────────────────────────────────────────────────
// Encryption / Decryption for sensitive data (e.g. Shopify API keys)
// ─────────────────────────────────────────────────

/**
 * Encrypt a plaintext string using AES
 */
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt an AES-encrypted string
 */
export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ─────────────────────────────────────────────────
// Shopify Webhook HMAC Verification
// ─────────────────────────────────────────────────

/**
 * Verify the HMAC-SHA256 signature from Shopify webhooks
 * @param rawBody - Raw request body buffer (must be Buffer, not parsed JSON)
 * @param hmacHeader - X-Shopify-Hmac-SHA256 header value
 * @param secret - Shopify webhook secret
 */
export const verifyShopifyWebhook = (
  rawBody: Buffer,
  hmacHeader: string,
  secret: string
): boolean => {
  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────
// Referral Code Generator
// Format: First 4 letters of name + 3-digit random number
// Example: ABHI001
// ─────────────────────────────────────────────────

/**
 * Generate a unique referral code from a partner's name
 */
export const generateReferralCode = (fullName: string, suffix?: number): string => {
  const namePart = fullName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');

  const numPart = String(suffix || Math.floor(100 + Math.random() * 900)).padStart(3, '0');
  return `${namePart}${numPart}`;
};

/**
 * Generate a secure random OTP (6 digits)
 */
export const generateOTP = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Generate a secure reset token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
