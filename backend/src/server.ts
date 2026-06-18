import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─────────────────────────────────────────────────
// Environment Variable Validation (fail fast)
// ─────────────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

import app from './app';
import prisma from './config/database';
import { verifyEmailConnection } from './config/email';

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────
// Database Connection with Retry (for NeonDB scale-to-zero)
// ─────────────────────────────────────────────────
const connectWithRetry = async (retries = 5, delay = 3000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL database connected via Prisma');
      return;
    } catch (error) {
      console.warn(`⚠️  DB connection attempt ${i + 1}/${retries} failed. Retrying in ${delay / 1000}s...`);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('❌ Could not connect to database after multiple retries.');
};

// ─────────────────────────────────────────────────
// Server Initialization
// ─────────────────────────────────────────────────

const startServer = async () => {
  try {
    // 1. Connect to Database (with retry for NeonDB wake-up)
    await connectWithRetry();

    // 2. Verify Email Transporter (async, non-blocking)
    verifyEmailConnection();

    // 3. Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle NeonDB idle connection drops — log but don't crash
    prisma.$on('error' as never, (e: any) => {
      console.warn('⚠️  Prisma connection event:', e?.message || e);
    });

    // Graceful Shutdown Handler
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Prevent crashes from unhandled errors — log and keep running
    process.on('unhandledRejection', (reason) => {
      console.error('⚠️  Unhandled Rejection (server kept running):', reason);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

