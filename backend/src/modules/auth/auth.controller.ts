import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as authService from './auth.service';
import { getCookieOptions } from '../../utils/jwt.utils';
import { successResponse } from '../../utils/pagination.utils';
import { errorResponse } from '../../utils/pagination.utils';
import path from 'path';


// ─────────────────────────────────────────────────
// Auth Controller — HTTP Layer
// ─────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pic = await authService.registerPIC(req.body);
    res.status(201).json(successResponse(pic, 'Application submitted successfully! Please wait for admin approval.'));
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.verifyOTP(req.body.email, req.body.otp);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

export const picLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 PIC Login Step 1 - sending WhatsApp OTP for: ${email}`);

    if (!email || !password) {
      return next(new Error('Email and password are required'));
    }

    // Step 1: validate credentials and send WhatsApp OTP (or bypass)
    const result = await authService.sendLoginOTP(email, password) as any;

    if (result.bypass) {
      res.cookie('token', result.token, getCookieOptions());
      console.log(`✅ PIC Login bypassed OTP for: ${email}`);
      return res.status(200).json(successResponse({ user: result.user, token: result.token }, 'Login successful'));
    }

    console.log(`✅ WhatsApp OTP sent to: ${result.phone}`);
    res.status(200).json({ success: true, message: result.message, data: { phone: result.phone } });
  } catch (error) {
    console.error('❌ PIC Login error:', error instanceof Error ? error.message : error);
    next(error);
  }
};

/**
 * POST /auth/verify-login-otp
 * Step 2 of 2FA Login — verify WhatsApp OTP and issue JWT token
 */
export const verifyLoginOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new Error('Email and OTP are required'));
    }

    const { token, user } = await authService.verifyLoginOTP(email, otp);

    res.cookie('token', token, getCookieOptions());
    console.log(`✅ PIC Login 2FA verified for: ${email}`);
    res.status(200).json(successResponse({ user, token }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Admin Login attempt for: ${email}`);

    if (!email || !password) {
      return next(new Error('Email and password are required'));
    }

    const { token, user } = await authService.loginAdmin(email, password);

    res.cookie('token', token, getCookieOptions());
    
    console.log(`✅ Admin Login successful for: ${email}`);
    res.status(200).json(successResponse({ user, token }, 'Admin login successful'));
  } catch (error) {
    console.error('❌ Admin Login error:', error instanceof Error ? error.message : error);
    next(error);
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.resendOTP(email);
    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { path: '/', secure: true, sameSite: 'none' });
  res.status(200).json(successResponse(null, 'Logged out successfully'));
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.resetPassword(req.params.token, req.body.password);
    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/reset-password-otp
 * Reset password using WhatsApp OTP (no token link required)
 */
export const resetPasswordWithOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return next(new Error('Email, OTP and new password are required'));
    }
    const result = await authService.resetPasswordWithOTP(email, otp, password);
    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id, req.user!.role);
    res.status(200).json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/complete-profile/kyc
 * Handles multipart/form-data with file uploads (aadhaarDocument, panDocument)
 */
export const completeProfileKYC = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const picId = req.user!.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // In production (Cloudinary): file.path is already a full URL
    // In development (local disk): file.path is an absolute path, convert to relative
    const getFileUrl = (file?: Express.Multer.File): string | undefined => {
      if (!file) return undefined;
      // Cloudinary returns a full URL starting with https://
      if (file.path.startsWith('http')) return file.path;
      return '/uploads/docs/' + path.basename(file.path);
    };

    const result = await authService.completeProfileKYC(picId, req.body, {
      aadhaarDocument: getFileUrl(files?.aadhaarDocument?.[0]),
      panDocument: getFileUrl(files?.panDocument?.[0]),
    });

    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/complete-profile/experience
 * Handles multipart/form-data with optional resume upload
 */
export const completeProfileExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const picId = req.user!.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const getFileUrl = (file?: Express.Multer.File): string | undefined => {
      if (!file) return undefined;
      if (file.path.startsWith('http')) return file.path;
      return '/uploads/docs/' + path.basename(file.path);
    };

    const resumePath = getFileUrl(files?.resumeDocument?.[0]);

    const result = await authService.completeProfileExperience(picId, req.body, resumePath);
    res.status(200).json(successResponse(null, result.message));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// Google OAuth Controllers
// ─────────────────────────────────────────────────

/**
 * GET /auth/google
 * Initiate Google OAuth2 flow
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * GET /auth/google/callback
 * Handle Google OAuth2 callback — generate JWT → redirect to frontend
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('google', { session: false }, async (err: Error | null, pic: any) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (err || !pic) {
      const message = err?.message || 'Google authentication failed';
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }

    try {
      const { token, user } = await authService.loginWithGoogle(pic);

      // Set HTTP-only cookie (works on same-domain; may not work cross-domain)
      res.cookie('token', token, getCookieOptions());

      // Also pass token via URL so the frontend callback page can store it
      // and call /api/auth/me to properly hydrate the session
      const redirectUrl = `${frontendUrl}/google-callback?token=${encodeURIComponent(token)}`;
      res.redirect(redirectUrl);
    } catch (serviceError: any) {
      const message = serviceError?.message || 'Authentication error';
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  })(req, res, next);
};
