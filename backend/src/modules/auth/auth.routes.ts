import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import { kycUpload } from '../../middleware/upload.middleware';
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

// PIC Registration (Step 1 — basic info only)
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// OTP Verification (legacy — kept for backward compat)
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), authController.verifyOTP);

// Resend OTP (legacy)
router.post('/resend-otp', authLimiter, authController.resendOTP);

// PIC Login
router.post('/login', authLimiter, validate(picLoginSchema), authController.picLogin);

// Admin Login
router.post('/admin/login', authLimiter, validate(adminLoginSchema), authController.adminLogin);

// Logout
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getMe);

// Forgot Password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// Reset Password
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// ─────────────────────────────────────────────────
// Google OAuth Routes
// ─────────────────────────────────────────────────

// Initiate Google OAuth flow
router.get('/google', authController.googleAuth);

// Google OAuth callback (called by Google after user consents)
router.get('/google/callback', authController.googleCallback);

// ─────────────────────────────────────────────────
// Profile Completion Routes (protected — after admin approval)
// ─────────────────────────────────────────────────

// Step 2 — KYC & Bank Details (with file uploads)
router.post(
  '/complete-profile/kyc',
  protect,
  kycUpload,
  authController.completeProfileKYC
);

// Step 3 — Experience & PIC Details (with optional resume upload)
router.post(
  '/complete-profile/experience',
  protect,
  kycUpload,
  authController.completeProfileExperience
);

export default router;

