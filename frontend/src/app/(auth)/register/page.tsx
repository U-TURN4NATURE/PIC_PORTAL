"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, MapPin, User, Lock, Phone, Mail, Home, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  password: z
    .string()
    .min(6, 'At least 6 characters'),
  address: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const BACKEND_URL = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'https://picportal-production-a624.up.railway.app'
    : 'http://localhost:5000';

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await api.post('/auth/register', data);
      setIsSuccess(true);
    } catch (error: any) {
      const apiError = error.response?.data;
      if (apiError?.errors?.length) {
        apiError.errors.forEach((e: { field: string; message: string }) =>
          toast.error(`${e.field}: ${e.message}`)
        );
      } else {
        toast.error(apiError?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-dm-serif text-brand-forest mb-3">Application Submitted!</h2>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Your application has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Please wait for admin approval. You will be able to complete your profile and start earning after approval.
          </p>
          <div className="bg-brand-sage/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-brand-forest mb-1">What happens next?</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✅ Our team reviews your application</li>
              <li>✅ You receive an approval notification</li>
              <li>✅ Login to complete your KYC & profile</li>
              <li>✅ Start earning with your unique referral code!</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-brand-forest text-white py-3 rounded-xl font-medium hover:bg-brand-forest/90 transition-colors flex items-center justify-center gap-2"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-olive/10 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-brand-gold/10 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 md:p-8 relative z-10 border border-white/50 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={() => router.back()}
            className="absolute top-0 left-0 p-2 text-brand-olive hover:text-brand-forest hover:bg-brand-sage/10 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
            title="Go Back"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex justify-center mb-4 mt-2">
            <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={200} height={70} className="object-contain mix-blend-multiply" />
          </div>
          <h1 className="font-dm-serif text-2xl text-brand-forest mt-2">Join Us</h1>
          <p className="text-brand-olive text-sm mt-2">Become a <strong>Partner in Change (PIC)</strong> — Be part of India&apos;s Homemade Revolution</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Personal Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-brand-forest" />
              <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName?.message}>
                <input {...register('fullName')} placeholder="John Doe" className={inputClass} />
              </Field>
              <Field label="Email Address" error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
              </Field>
              <Field label="Phone Number" error={errors.phone?.message}>
                <input {...register('phone')} placeholder="9876543210" className={inputClass} />
              </Field>
              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-forest transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>

          <hr className="border-brand-sage/30" />

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-brand-forest" />
              <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Address</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Full Address" error={errors.address?.message}>
                <input {...register('address')} placeholder="House No, Street, Area" className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="City" error={errors.city?.message}>
                  <input {...register('city')} placeholder="Mumbai" className={inputClass} />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <select {...register('state')} className={inputClass}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Pincode" error={errors.pincode?.message}>
                  <input {...register('pincode')} placeholder="400001" className={inputClass} />
                </Field>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-6 shadow-lg shadow-brand-forest/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isLoading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already a partner?{' '}
          <Link href="/login" className="text-brand-forest font-medium hover:underline">
            Login here
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR REGISTER WITH</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Registration Button */}
        <a
          href={`${BACKEND_URL}/api/auth/google`}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Register with Google — Takes 5 seconds
        </a>
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all text-sm";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-forest mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
