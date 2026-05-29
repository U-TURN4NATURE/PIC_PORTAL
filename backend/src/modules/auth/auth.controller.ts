import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { getCookieOptions } from '../../utils/jwt.utils';
import { successResponse, errorResponse } from '../../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Auth Controller — HTTP Layer
// ─────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pic = await authService.registerPIC(req.body);
    res.status(201).json(successResponse(pic, 'Application submitted successfully. Please check your email to verify your account.'));
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

    // Set HTTP-only cookie
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
