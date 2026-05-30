import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

// Middleware
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rate-limit.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import picRoutes from './modules/pic/pic.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import shopifyRoutes from './modules/shopify/shopify.routes';

// ─────────────────────────────────────────────────
// Express Application Bootstrap
// ─────────────────────────────────────────────────

const app: Express = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  /\.vercel\.app$/,  // Allow all Vercel preview & production URLs
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      if (isAllowed) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Webhooks (Must be parsed before general body parser to keep raw body for HMAC)
app.use('/api/webhooks/shopify', shopifyRoutes);

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

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 8. 404 Handler
app.use(notFoundHandler);

// 9. Global Error Handler (Must be last)
app.use(globalErrorHandler);

export default app;
