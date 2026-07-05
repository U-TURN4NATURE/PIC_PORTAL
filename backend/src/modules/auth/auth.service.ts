import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt.utils';
import { generateOTP, generateResetToken } from '../../utils/crypto.utils';
import { sendOTPEmail, sendPasswordResetEmail } from '../../services/email.service';
import { sendSMSOTP } from '../../services/sms.service';
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

  // Check if phone already registered
  const existingPhone = await prisma.pICPartner.findFirst({ where: { phone: data.phone } });
  if (existingPhone) {
    throw createError('An account with this phone number already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Generate OTP for WhatsApp phone verification
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
      isEmailVerified: false, // Will be verified via WhatsApp OTP
      profileCompleted: false,
      otpCode: otp,
      otpExpiresAt: otpExpiry,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  // Send OTP via SMS (WishBySMS)
  sendSMSOTP(data.phone, otp).catch((err) =>
    console.error('❌ SMS OTP send failed during registration:', err)
  );

  // Send OTP via Email (fire-and-forget)
  sendOTPEmail(data.email, data.fullName, otp).catch((err) =>
    console.error('❌ Email OTP send failed during registration:', err)
  );

  return {
    ...pic,
    message: 'Registration successful! Please verify your WhatsApp number with the OTP sent.',
  };
};

/**
 * PIC Login — allowed for PENDING, APPROVED, ACTIVE users.
 * Only REJECTED and SUSPENDED users are blocked.
 */
/**
 * Step 1 of Login — validate credentials, send WhatsApp OTP for 2FA
 * Returns a temporary sessionToken so frontend can call verifyLoginOTP next.
 */
export const sendLoginOTP = async (identifier: string, password?: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!pic) throw createError('Account not found', 404);

  // If a password was provided, verify it
  if (password) {
    if (!pic.password) throw createError('This account uses Google Sign-In. Please use the "Continue with Google" button.', 400);
    const isPasswordValid = await bcrypt.compare(password, pic.password);
    if (!isPasswordValid) throw createError('Invalid email/phone or password', 401);
  }

  if (pic.status === PICStatus.REJECTED) {
    throw createError(
      `Your application has been rejected. ${pic.rejectionReason ? 'Reason: ' + pic.rejectionReason : 'Please contact support.'}`,
      403
    );
  }
  if (pic.status === PICStatus.SUSPENDED) {
    throw createError('Your account has been suspended. Please contact admin.', 403);
  }

  // ── GENERATE AND SEND OTP (No Bypass) ──
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { otpCode: otp, otpExpiresAt: otpExpiry },
  });



  // Send SMS OTP
  sendSMSOTP(pic.phone, otp).catch(console.error);

  // Also send email as backup
  sendOTPEmail(pic.email, pic.fullName, otp).catch(console.error);

  return {
    bypass: false,
    phone: pic.phone,
    message: 'OTP sent successfully to your phone and email.',
  };
};

/**
 * Step 2 of Login — verify the WhatsApp OTP and issue JWT token
 */
export const verifyLoginOTP = async (identifier: string, otp: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });
  if (!pic) throw createError('Account not found', 404);
  if (!pic.otpCode || !pic.otpExpiresAt) throw createError('No OTP found. Please request a new one.', 400);
  if (new Date() > pic.otpExpiresAt) throw createError('OTP has expired. Please request a new one.', 400);
  if (pic.otpCode !== otp) throw createError('Invalid OTP', 400);

  // Clear OTP after successful verification
  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { otpCode: null, otpExpiresAt: null, isEmailVerified: true },
  });

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
 * Reset password using temporary password (No OTP/Email required)
 */
export const resetPasswordWithTemp = async (email: string, tempPassword: string, newPassword: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  if (!pic) throw createError('Invalid email or temporary password', 400);

  if (!pic.password) throw createError('This account uses Google Sign-In. Cannot reset password.', 400);

  const isPasswordValid = await bcrypt.compare(tempPassword, pic.password);
  if (!isPasswordValid) throw createError('Invalid email or temporary password', 400);

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { password: hashedNewPassword, mustChangePassword: false },
  });

  return { message: 'Password reset successfully. You can now login with your new password.' };
};

/**
 * Direct login (kept for admin / backward compat). PIC login now uses 2FA.
 */
export const loginPIC = async (email: string, password: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });

  if (!pic) throw createError('Invalid email or password', 401);

  // Google-only accounts have no password
  if (!pic.password) throw createError('This account uses Google Sign-In. Please use the "Continue with Google" button.', 400);

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
      panCard: pic.panCard,
      aadhaarNumber: pic.aadhaarNumber,
      isPolicyAccepted: pic.isPolicyAccepted,
      role: 'PIC' as const,
    },
  };
};

/**
 * Google OAuth Login / Registration
 * Called after Passport has already found/created the PICPartner
 */
export const loginWithGoogle = async (pic: { id: string; email: string; status: string; rejectionReason: string | null; fullName: string; phone: string; referralCode: string | null; profileCompleted: boolean; profileImage: string | null; panCard: string | null; aadhaarNumber: string | null; isPolicyAccepted: boolean }) => {
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
      panCard: pic.panCard,
      aadhaarNumber: pic.aadhaarNumber,
      isPolicyAccepted: pic.isPolicyAccepted,
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
  // Aadhaar and PAN documents are optional based on the new flow
  // if (!files.aadhaarDocument) throw createError('Aadhaar document is required', 400);
  // if (!files.panDocument) throw createError('PAN document is required', 400);

  await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      // Only update aadhaarNumber if a new value is provided (preserve existing)
      ...(data.aadhaarNumber ? { aadhaarNumber: data.aadhaarNumber } : {}),
      // Only update panCard if a new value is provided (preserve existing)
      ...(data.panCard ? { panCard: data.panCard } : {}),
      bankAccountName: data.bankAccountName,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      ifscCode: data.ifscCode,
      branchName: data.branchName,
      upiId: data.upiId || null,
      ...(files.aadhaarDocument ? { aadhaarDocument: files.aadhaarDocument } : {}),
      ...(files.panDocument ? { panDocument: files.panDocument } : {}),
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
    availability: string;
    instagramProfile?: string;
    facebookProfile?: string;
    linkedinProfile?: string;
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
      availability: data.availability,
      instagramProfile: data.instagramProfile || null,
      facebookProfile: data.facebookProfile || null,
      linkedinProfile: data.linkedinProfile || null,
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
export const forgotPassword = async (identifier: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });
  if (!pic) return { message: 'If an account exists, a reset OTP has been sent.' };

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { otpCode: otp, otpExpiresAt: otpExpiry },
  });

  // Send SMS OTP
  sendSMSOTP(pic.phone, otp).catch(console.error);

  // Also send email reset link as backup
  const resetToken = generateResetToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { resetToken, resetTokenExpiry: resetExpiry },
  });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  // Send email in the background without awaiting so it doesn't block the API response
  sendPasswordResetEmail(pic.email, pic.fullName, resetUrl, otp).catch(console.error);

  return {
    message: 'OTP sent to your Phone and Email. Enter the OTP to reset your password.',
    phone: pic.phone,
  };
};

/**
 * Verify WhatsApp OTP for password reset and set new password in one step
 */
export const resetPasswordWithOTP = async (identifier: string, otp: string, newPassword: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });
  if (!pic) throw createError('Account not found', 404);
  if (!pic.otpCode || !pic.otpExpiresAt) throw createError('No OTP found. Please request a new one.', 400);
  if (new Date() > pic.otpExpiresAt) throw createError('OTP has expired. Please request a new one.', 400);
  if (pic.otpCode !== otp) throw createError('Invalid OTP', 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpiresAt: null,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Password reset successfully. You can now login.' };
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
      aadhaarNumber: true,
      panCard: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      instagramProfile: true,
      facebookProfile: true,
      linkedinProfile: true,
      upiId: true,
      bankAccountName: true,
      bankName: true,
      bankAccountNumber: true,
      ifscCode: true,
      branchName: true,
      pendingBankDetails: true,
      mustChangePassword: true,
    },
  });

  if (!pic) throw createError('User not found', 404);
  return { ...pic, role: 'PIC' };
};

// ─────────────────────────────────────────────────
// Phone / WhatsApp OTP Verification (Registration flow)
// ─────────────────────────────────────────────────

/**
 * Verify WhatsApp OTP after registration to confirm phone number
 */
export const verifyOTP = async (email: string, otp: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  if (!pic) throw createError('Account not found', 404);
  if (pic.isEmailVerified) throw createError('Phone already verified', 400);
  if (!pic.otpCode || !pic.otpExpiresAt) throw createError('No OTP found. Please request a new one.', 400);
  if (new Date() > pic.otpExpiresAt) throw createError('OTP has expired. Please request a new one.', 400);
  if (pic.otpCode !== otp) throw createError('Invalid OTP', 400);

  await prisma.pICPartner.update({
    where: { email },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  return { message: 'WhatsApp number verified successfully! Your application is pending admin approval.' };
};

/**
 * Resend WhatsApp OTP (registration phone verification or login)
 */
export const resendOTP = async (identifier: string) => {
  const pic = await prisma.pICPartner.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });
  if (!pic) throw createError('Account not found', 404);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.pICPartner.update({
    where: { id: pic.id },
    data: { otpCode: otp, otpExpiresAt: otpExpiry },
  });



  // Send SMS OTP
  sendSMSOTP(pic.phone, otp).catch(console.error);

  // Also send email as backup for registration OTPs only
  if (!pic.isEmailVerified) {
    sendOTPEmail(email, pic.fullName, otp).catch(console.error);
  }

  return { message: 'A new OTP has been sent to your WhatsApp number.' };
};

// ─────────────────────────────────────────────────
// Password Reset Request (Admin Approval Flow)
// ─────────────────────────────────────────────────

/**
 * Submit a password reset request to admin (when user is logged out / forgets password)
 * Public endpoint — identified by email only
 */
export const submitPasswordResetRequestPublic = async (email: string, requestNote?: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { email } });
  // Don't reveal if account exists
  if (!pic) return { message: 'If an account with this email exists, your request has been submitted for admin review.' };

  // Check if there's already a pending request
  const existing = await prisma.passwordResetRequest.findFirst({
    where: { picId: pic.id, status: 'PENDING' },
  });
  if (existing) {
    throw createError('You already have a pending password reset request. Please wait for admin to review it.', 409);
  }

  await prisma.passwordResetRequest.create({
    data: {
      picId: pic.id,
      status: 'PENDING',
      requestNote: requestNote || null,
    },
  });

  return { message: 'Your password reset request has been submitted. Admin will review it and you will be notified shortly.' };
};

/**
 * Submit a password reset request (authenticated — PIC is logged in)
 */
export const submitPasswordResetRequest = async (picId: string, requestNote?: string) => {
  // Check if there's already a pending request
  const existing = await prisma.passwordResetRequest.findFirst({
    where: { picId, status: 'PENDING' },
  });
  if (existing) {
    throw createError('You already have a pending password reset request. Please wait for admin to review it.', 409);
  }

  await prisma.passwordResetRequest.create({
    data: {
      picId,
      status: 'PENDING',
      requestNote: requestNote || null,
    },
  });

  return { message: 'Your password reset request has been submitted. Admin will review it and you will be notified shortly.' };
};

/**
 * Change password when mustChangePassword is true (force-change flow)
 */
export const forceChangePassword = async (picId: string, newPassword: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('Account not found', 404);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Password changed successfully. Welcome!' };
};
