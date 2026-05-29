import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import {
  registerSchema,
  picLoginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from './auth.schemas';

const router = Router();

// ─────────────────────────────────────────────────
// Auth Routes
// ─────────────────────────────────────────────────

// PIC Registration
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// OTP Verification
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', authLimiter, authController.resendOTP);

// PIC Login
router.post('/login', authLimiter, validate(picLoginSchema), authController.picLogin);

// Admin Login
router.post('/admin/login', authLimiter, validate(adminLoginSchema), authController.adminLogin);

// Logout (protected — must be logged in)
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getMe);

// Forgot Password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// Reset Password
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
