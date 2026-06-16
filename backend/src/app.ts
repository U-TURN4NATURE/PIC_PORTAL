import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

// Middleware
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rate-limit.middleware';

// Passport (Google OAuth — must be imported to register strategy)
import './config/passport';

// Routes
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import picRoutes from './modules/pic/pic.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import picReferralRoutes from './modules/referral/referral.routes';
import adminReferralRoutes from './modules/referral/referral.admin.routes';
import picFollowUpRoutes from './modules/followup/followup.routes';
import adminFollowUpRoutes from './modules/followup/followup.admin.routes';

// ─────────────────────────────────────────────────
// Express Application Bootstrap
// ─────────────────────────────────────────────────

const app: Express = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS — allow all origins (needed for Vercel + Railway cross-domain)
app.use(
  cors({
    origin: true, // reflect the request origin — allows any domain
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);



// 3. Passport middleware (stateless — no sessions)
app.use(require('passport').initialize());

// 4. Body Parsers & Cookies (For all other routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Rate Limiting
app.use('/api', generalLimiter);

// 6. Static Files (for uploads if any)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 7. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pic', picRoutes);
app.use('/api/pic/wallet', walletRoutes);
app.use('/api/pic/referrals', picReferralRoutes);
app.use('/api/pic/referrals', picFollowUpRoutes);
app.use('/api/pic/followups', picFollowUpRoutes);
app.use('/api/admin/referrals', adminReferralRoutes);
app.use('/api/admin/followups', adminFollowUpRoutes);

// Root Endpoint
app.get('/', (_req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'PIC Portal API is running!', 
    docs: 'API routes are available under /api',
    timestamp: new Date()
  });
});

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 8. 404 Handler
app.use(notFoundHandler);

// 9. Global Error Handler (Must be last)
app.use(globalErrorHandler);

export default app;
