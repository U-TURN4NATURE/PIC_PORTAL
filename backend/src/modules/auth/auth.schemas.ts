import { z } from 'zod';

// ─────────────────────────────────────────────────
// Auth Zod Validation Schemas
// ─────────────────────────────────────────────────

// Step 1 — Public Registration (basic info only)
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    address: z.string().min(5, 'Address is required'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode (6 digits required)'),
    gender: z.string().min(1, 'Gender is required'),
  }),
});

export const picLoginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Phone is required'),
    password: z.string().optional(),
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
    identifier: z.string().min(1, 'Email or Phone is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
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
    identifier: z.string().min(1, 'Email or Phone is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

// Step 2 — KYC & Bank Details (after admin approval)
export const completeProfileKYCSchema = z.object({
  body: z.object({
    aadhaarNumber: z.string().regex(/^\d{12}$/, 'Invalid Aadhaar number (12 digits required)').optional().or(z.literal('')),
    panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format (e.g. ABCDE1234F)').optional().or(z.literal('')),
    bankAccountName: z.string().min(2, 'Account holder name is required'),
    bankName: z.string().min(2, 'Bank name is required'),
    bankAccountNumber: z.string().min(8, 'Valid account number required'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0001234)'),
    branchName: z.string().min(2, 'Branch name is required'),
    upiId: z.string().optional().or(z.literal('')),
  }),
});

// Step 3 — Experience & PIC Details (after approval)
export const completeProfileExperienceSchema = z.object({
  body: z.object({
    occupation: z.string().min(2, 'Occupation is required'),
    yearsOfExperience: z.string().min(1, 'Years of experience is required'),
    skills: z.string().min(2, 'Please list your skills'),
    education: z.string().min(2, 'Education is required'),
    whyJoin: z.string().min(20, 'Please provide at least 20 characters explaining why you want to join'),
    availability: z.string().min(1, 'Availability is required'),
    instagramProfile: z.string().url('Invalid URL').optional().or(z.literal('')),
    facebookProfile: z.string().url('Invalid URL').optional().or(z.literal('')),
    linkedinProfile: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
});
