"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setCountdown(60); // 60s cooldown before resend
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email: submittedEmail });
      toast.success('Reset link resent!');
      setCountdown(60);
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State ──
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center relative z-10">
          {/* Animated envelope */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-forest to-brand-olive rounded-2xl flex items-center justify-center shadow-lg shadow-brand-forest/20">
              <Send className="w-9 h-9 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-forest mb-2">Check Your Inbox</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            We've sent a password reset link to:
          </p>
          <p className="text-brand-forest font-semibold text-base mb-6 bg-brand-sage/20 px-4 py-2 rounded-xl inline-block">
            {submittedEmail}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-amber-800 text-xs font-semibold mb-1">⏱ Link expires in 1 hour</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Check your spam/junk folder if you don't see it in your inbox. The email comes from U-Turn4Nature.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={countdown > 0 || isLoading}
            className="w-full py-3 rounded-xl border border-brand-sage/50 text-brand-forest font-medium text-sm hover:bg-brand-sage/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Reset Link'
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Form State ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={180} height={72} className="object-contain h-16 w-auto" />
            </div>
          </div>
          <div className="w-12 h-12 bg-brand-forest/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-brand-forest" />
          </div>
          <h1 className="text-2xl font-bold text-brand-forest mb-1">Forgot Password?</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            No worries! Enter your registered email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-forest mb-1">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-forest/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
