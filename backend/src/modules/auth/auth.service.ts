import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt.utils';
import { generateOTP, generateResetToken } from '../../utils/crypto.utils';
import { sendOTPEmail, sendPasswordResetEmail } from '../../services/email.service';
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
}

/**
 * Register a new PIC Partner — Step 1 only (basic info)
 * Status starts as PENDING. No KYC or experience collected here.
 */
export const registerPIC = async (data: RegisterInput) => {
  const existingPIC = await prisma.pICPartner.findUnique({ where: { email: data.email } });
  if (existingPIC) {
    throw createError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const pic = await prisma.pICPartner.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      address: data.address,
      state: data.state,
      city: data.city,
      pincode: data.pincode,
      status: PICStatus.PENDING,
      isEmailVerified: true, // Auto-verified in new flow
      profileCompleted: false,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  return pic;
};

/**
 * PIC Login — allowed for PENDING, APPROVED, ACTIVE users.
 * Only REJECTED and SUSPENDED users are blocked.
 */
export const loginPIC = async (email: string, password: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });

  if (!pic) throw createError('Invalid email or password', 401);

  const isPasswordValid = await bcrypt.compare(password, pic.password);
  if (!isPasswordValid) throw createError('Invalid email or password', 401);

  if (pic.status === PICStatus.REJECTED) {
    throw createError(
      `Your application has been rejected. ${pic.rejectionReason ? 'Reason: ' + pic.rejectionReason : 'Please contact support.'}`,
      403
    );
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
      phone: pic.phone,
      referralCode: pic.referralCode,
      status: pic.status,
      profileCompleted: pic.profileCompleted,
      profileImage: pic.profileImage,
      role: 'PIC' as const,
    },
  };
};

/**
 * Step 2 — Complete KYC & Bank Details (only for APPROVED users)
 */
export const completeProfileKYC = async (
  picId: string,
  data: {
    aadhaarNumber: string;
    panCard: string;
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    ifscCode: string;
    branchName: string;
    upiId?: string;
  },
  files: {
    aadhaarDocument?: string;
    panDocument?: string;
  }
) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('User not found', 404);
  if (pic.status !== PICStatus.APPROVED && pic.status !== PICStatus.ACTIVE) {
    throw createError('Only approved users can complete their profile', 403);
  }
  if (!files.aadhaarDocument) throw createError('Aadhaar document is required', 400);
  if (!files.panDocument) throw createError('PAN document is required', 400);

  await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      aadhaarNumber: data.aadhaarNumber,
      panCard: data.panCard,
      bankAccountName: data.bankAccountName,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      ifscCode: data.ifscCode,
      branchName: data.branchName,
      upiId: data.upiId || null,
      aadhaarDocument: files.aadhaarDocument,
      panDocument: files.panDocument,
    },
  });

  return { message: 'KYC & bank details saved. Please complete Step 3.' };
};

/**
 * Step 3 — Complete Experience & PIC Details (only for APPROVED users)
 * Sets profileCompleted = true and status = ACTIVE
 */
export const completeProfileExperience = async (
  picId: string,
  data: {
    occupation: string;
    yearsOfExperience: string;
    skills: string;
    education: string;
    whyJoin: string;
    preferredWorkingArea: string;
    preferredDistrict: string;
    preferredState: string;
    availability: string;
    instagramProfile?: string;
  },
  resumeDocument?: string
) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('User not found', 404);
  if (pic.status !== PICStatus.APPROVED && pic.status !== PICStatus.ACTIVE) {
    throw createError('Only approved users can complete their profile', 403);
  }

  await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      occupation: data.occupation,
      yearsOfExperience: data.yearsOfExperience,
      skills: data.skills,
      education: data.education,
      whyJoin: data.whyJoin,
      preferredWorkingArea: data.preferredWorkingArea,
      preferredDistrict: data.preferredDistrict,
      preferredState: data.preferredState,
      availability: data.availability,
      instagramProfile: data.instagramProfile || null,
      resumeDocument: resumeDocument || null,
      experience: data.yearsOfExperience,
      profileCompleted: true,
      profileCompletedAt: new Date(),
      status: PICStatus.ACTIVE,
    },
  });

  // Create wallet if not exists
  await prisma.wallet.upsert({
    where: { picId },
    create: { picId, totalEarnings: 0, pendingEarnings: 0, paidEarnings: 0, availableBalance: 0 },
    update: {},
  });

  return { message: 'Profile completed! You now have full access to the PIC dashboard.' };
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
      role: 'ADMIN' as const,
    },
  };
};

/**
 * Initiate password reset
 */
export const forgotPassword = async (email: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
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
      profileCompleted: true,
      isEmailVerified: true,
      isPolicyAccepted: true,
      rejectionReason: true,
      createdAt: true,
      approvedAt: true,
      profileCompletedAt: true,
      wallet: true,
    },
  });

  if (!pic) throw createError('User not found', 404);
  return { ...pic, role: 'PIC' };
};

// Legacy OTP methods (kept for backward compat)
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

export const resendOTP = async (email: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  if (!pic) throw createError('Account not found', 404);
  if (pic.isEmailVerified) throw createError('Email already verified. Please login.', 400);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.pICPartner.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt: otpExpiry },
  });

  sendOTPEmail(email, pic.fullName, otp).catch(console.error);
  return { message: 'A new OTP has been sent to your email.' };
};
