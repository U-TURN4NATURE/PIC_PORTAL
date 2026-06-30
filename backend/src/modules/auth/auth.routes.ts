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

// PIC Login — Step 1: validate credentials + send WhatsApp OTP
router.post('/login', authLimiter, validate(picLoginSchema), authController.picLogin);

// PIC Login — Step 2: verify WhatsApp OTP and get JWT token
router.post('/verify-login-otp', authLimiter, validate(verifyOTPSchema), authController.verifyLoginOTP);

// Admin Login
router.post('/admin/login', authLimiter, validate(adminLoginSchema), authController.adminLogin);

// Logout
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getMe);

// Forgot Password — sends OTP via WhatsApp + email reset link
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// Reset Password via OTP (WhatsApp) — preferred method
router.post('/reset-password-otp', authLimiter, authController.resetPasswordWithOTP);

// Reset Password via Token (email link — backup)
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// ─────────────────────────────────────────────────
// Admin Approval Password Reset Routes
// ─────────────────────────────────────────────────

// Submit password reset request to admin (public — no login needed)
router.post('/request-password-reset', authLimiter, authController.submitPasswordResetRequestPublic);

// Submit password reset request (authenticated PIC)
router.post('/submit-reset-request', protect, authController.submitPasswordResetRequest);

// Force change password (when mustChangePassword === true after admin set temp password)
router.post('/force-change-password', protect, authController.forceChangePassword);


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

