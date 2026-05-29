import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt.utils';
import { generateOTP, generateResetToken, generateReferralCode } from '../../utils/crypto.utils';
import { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../../services/email.service';
import { createError } from '../../middleware/error.middleware';
import { PICStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// Auth Service — Business Logic
// ─────────────────────────────────────────────────

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  panCard: string;
  aadhaarNumber: string;
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  instagramProfile?: string;
  experience: string;
  whyJoin: string;
}

/**
 * Register a new PIC Partner (status = PENDING)
 */
export const registerPIC = async (data: RegisterInput) => {
  // Check if email already exists
  const existingPIC = await prisma.pICPartner.findUnique({ where: { email: data.email } });
  if (existingPIC) {
    throw createError('An account with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Generate OTP for email verification
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create PIC Partner
  const pic = await prisma.pICPartner.create({
    data: {
      ...data,
      password: hashedPassword,
      otpCode: otp,
      otpExpiresAt: otpExpiry,
      status: PICStatus.PENDING,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  // Send OTP verification email (non-blocking)
  sendOTPEmail(data.email, data.fullName, otp).catch(console.error);

  return pic;
};

/**
 * Verify OTP for email verification
 */
export const verifyOTP = async (email: string, otp: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  if (!pic) throw createError('Account not found', 404);
  if (pic.isEmailVerified) throw createError('Email already verified', 400);
  if (!pic.otpCode || !pic.otpExpiresAt) throw createError('No OTP found. Please request a new one.', 400);
  if (new Date() > pic.otpExpiresAt) throw createError('OTP has expired. Please request a new one.', 400);
  if (pic.otpCode !== otp) throw createError('Invalid OTP', 400);

  await prisma.pICPartner.update({
    where: { email },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  return { message: 'Email verified successfully. Your application is pending admin approval.' };
};

/**
 * Resend OTP for email verification
 */
export const resendOTP = async (email: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  if (!pic) throw createError('Account not found', 404);
  if (pic.isEmailVerified) throw createError('Email already verified. Please login.', 400);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.pICPartner.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt: otpExpiry },
  });

  sendOTPEmail(email, pic.fullName, otp).catch(console.error);

  return { message: 'A new OTP has been sent to your email.' };
};

/**
 * PIC Login — only allowed if status === APPROVED
 */
export const loginPIC = async (email: string, password: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });

  if (!pic) throw createError('Invalid email or password', 401);

  // Check password
  const isPasswordValid = await bcrypt.compare(password, pic.password);
  if (!isPasswordValid) throw createError('Invalid email or password', 401);

  // Status checks
  if (pic.status === PICStatus.PENDING) {
    throw createError('Your application is pending admin approval. You will be notified via email.', 403);
  }
  if (pic.status === PICStatus.REJECTED) {
    throw createError('Your application has been rejected. Please contact support.', 403);
  }
  if (pic.status === PICStatus.SUSPENDED) {
    throw createError('Your account has been suspended. Please contact admin.', 403);
  }

  const token = generateToken({ id: pic.id, email: pic.email, role: 'PIC' });

  return {
    token,
    user: {
      id: pic.id,
      fullName: pic.fullName,
      email: pic.email,
      referralCode: pic.referralCode,
      status: pic.status,
      profileImage: pic.profileImage,
    },
  };
};

/**
 * Admin Login
 */
export const loginAdmin = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) throw createError('Invalid email or password', 401);

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) throw createError('Invalid email or password', 401);

  const token = generateToken({ id: admin.id, email: admin.email, role: 'ADMIN' });

  return {
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN',
    },
  };
};

/**
 * Initiate password reset — send reset token to email
 */
export const forgotPassword = async (email: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!pic) return { message: 'If an account exists, a reset link has been sent.' };

  const resetToken = generateResetToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.pICPartner.update({
    where: { email },
    data: { resetToken, resetTokenExpiry: resetExpiry },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  sendPasswordResetEmail(email, pic.fullName, resetUrl).catch(console.error);

  return { message: 'If an account exists, a reset link has been sent.' };
};

/**
 * Reset password using token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!pic) throw createError('Invalid or expired reset token', 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Password reset successfully. You can now login.' };
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (userId: string, role: string) => {
  if (role === 'ADMIN') {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return { ...admin, role: 'ADMIN' };
  }

  const pic = await prisma.pICPartner.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      profileImage: true,
      referralCode: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      wallet: true,
    },
  });

  if (!pic) throw createError('User not found', 404);
  return { ...pic, role: 'PIC' };
};
