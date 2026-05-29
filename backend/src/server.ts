import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import prisma from './config/database';
import { verifyEmailConnection } from './config/email';

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────
// Server Initialization
// ─────────────────────────────────────────────────

const startServer = async () => {
  try {
    // 1. Connect to Database
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected via Prisma');

    // 2. Verify Email Transporter (async, non-blocking)
    verifyEmailConnection();

    // 3. Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
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
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
