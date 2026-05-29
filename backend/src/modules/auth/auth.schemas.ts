import { z } from 'zod';

// ─────────────────────────────────────────────────
// Auth Zod Validation Schemas
// ─────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    address: z.string().min(5, 'Address is required'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode (6 digits required)'),
    panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format'),
    aadhaarNumber: z.string().regex(/^\d{12}$/, 'Invalid Aadhaar number (12 digits)'),
    upiId: z.string().optional().or(z.literal('')),
    bankAccountNumber: z.string().optional().or(z.literal('')),
    ifscCode: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val),
        'Invalid IFSC code format (e.g. SBIN0001234)'
      ),
    instagramProfile: z.string().url('Invalid URL').optional().or(z.literal('')),
    experience: z.string().min(1, 'Experience is required'),
    whyJoin: z.string().min(20, 'Please provide at least 20 characters explaining why you want to join'),
  }),
});

export const picLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});
