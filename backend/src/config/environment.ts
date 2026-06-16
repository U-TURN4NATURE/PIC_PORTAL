/**
 * Environment Configuration
 * Handles all environment variables with defaults and validation
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─────────────────────────────────────────────────
// Validate Required Environment Variables
// ─────────────────────────────────────────────────

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📋 Please set these variables in your Railway environment or .env file');
  process.exit(1);
}

// ─────────────────────────────────────────────────
// Export Validated Configuration
// ─────────────────────────────────────────────────

export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_EXPIRES_IN: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10),

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'U-Turn4Nature',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'noreply@uturn4nature.com',

  // Admin Seed
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL,
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
  ADMIN_SEED_NAME: process.env.ADMIN_SEED_NAME,
  ADMIN_SEED_PHONE: process.env.ADMIN_SEED_PHONE,

  // Shopify
  SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

  // Cloudinary (for file uploads)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Referral
  REFERRAL_BASE_URL: process.env.REFERRAL_BASE_URL || process.env.FRONTEND_URL,
  COMMISSION_RATE: parseInt(process.env.COMMISSION_RATE || '5', 10),

  // File Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
};

export default config;
