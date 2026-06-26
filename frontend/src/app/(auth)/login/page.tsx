"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2, ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Step: 'credentials' | 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [userEmail, setUserEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Show error if redirected back from Google with an error
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) toast.error(decodeURIComponent(error));
  }, [searchParams]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const BACKEND_URL = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'https://picportal-production-a624.up.railway.app'
    : 'http://localhost:5000';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { register: registerOTP, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors }, reset: resetOTP } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  // Step 1 — Send credentials, receive WhatsApp OTP
  const onSubmitCredentials = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);

      if (res.data.success) {
        // If backend bypassed OTP and returned token directly
        if (res.data.data?.token) {
          const { user, token } = res.data.data;
          setAuth(user, token);
          toast.success('Welcome back! 🎉');
          router.replace('/dashboard');
          return;
        }

        setUserEmail(data.email);
        // Backend returns masked phone like "7701XXXXXX05"
        setMaskedPhone(res.data.data?.phone || '');
        setStep('otp');
        setOtpTimer(30); // 30s before resend allowed
        toast.success('OTP sent to your WhatsApp! 📱');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Verify WhatsApp OTP, get JWT token
  const onSubmitOTP = async (data: OTPFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/verify-login-otp', {
        email: userEmail,
        otp: data.otp,
      });

      if (res.data.success) {
        const { user, token } = res.data.data;
        setAuth(user, token);
        toast.success('Welcome back! 🎉');
        router.replace('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      await api.post('/auth/resend-otp', { email: userEmail });
      toast.success('New OTP sent to your WhatsApp! 📱');
      setOtpTimer(30);
      resetOTP();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md p-8 glass-card rounded-2xl relative z-10 mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={200} height={80} className="object-contain h-20 w-auto" />
            </div>
          </div>
          <p className="text-brand-olive text-sm mt-2">Partners in Change (PIC) Portal</p>
        </div>

        {/* ── STEP 1: Credentials ── */}
        {step === 'credentials' && (
          <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-forest mb-1">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all"
                placeholder="hello@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-brand-forest">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-gold hover:text-brand-forest transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-brand-forest/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: WhatsApp OTP ── */}
        {step === 'otp' && (
          <div className="space-y-5">
            {/* WhatsApp icon + info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 items-start">
              <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">OTP sent via WhatsApp 📱</p>
                <p className="text-xs text-green-700 mt-1">
                  A 6-digit OTP has been sent to <strong>{maskedPhone ? `+91 ${maskedPhone}` : 'your registered WhatsApp number'}</strong>.
                  Valid for <strong>10 minutes</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleOTPSubmit(onSubmitOTP)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  {...registerOTP('otp')}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 text-center text-2xl font-bold tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all"
                  placeholder="------"
                />
                {otpErrors.otp && <p className="text-red-500 text-xs mt-1 text-center">{otpErrors.otp.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-brand-forest/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Resend + Back */}
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setStep('credentials')}
                className="text-gray-500 hover:text-brand-forest transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleResendOTP}
                disabled={isResending || otpTimer > 0}
                className="flex items-center gap-1 text-brand-gold hover:text-brand-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Google Sign-In — only on credentials step */}
        {step === 'credentials' && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <a
              href={`${BACKEND_URL}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all hover:shadow-md hover:-translate-y-0.5 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Want to become a PIC partner?{' '}
          <Link href="/register" className="text-brand-forest font-medium hover:underline">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white">
        <Loader2 className="w-8 h-8 text-brand-forest animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
