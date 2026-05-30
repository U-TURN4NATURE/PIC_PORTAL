import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { getCookieOptions } from '../../utils/jwt.utils';
import { successResponse } from '../../utils/pagination.utils';
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
    const { token, user } = await authService.loginPIC(email, password);

    res.cookie('token', token, getCookieOptions());
    res.status(200).json(successResponse({ user }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginAdmin(email, password);

    res.cookie('token', token, getCookieOptions());
    res.status(200).json(successResponse({ user }, 'Admin login successful'));
  } catch (error) {
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
  res.clearCookie('token', { path: '/' });
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
