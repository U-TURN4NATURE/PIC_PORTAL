"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2, Send, ShieldAlert, MessageSquare, KeyRound } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Schemas ───
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  requestNote: z.string().min(10, 'Please describe why you need to reset (min 10 characters)').max(500),
});

type EmailForm = z.infer<typeof emailSchema>;
type RequestForm = z.infer<typeof requestSchema>;

type Tab = 'otp' | 'admin';

export default function ForgotPasswordPage() {
  const [activeTab, setActiveTab] = useState<Tab>('otp');

  // ── OTP Tab State ──
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // ── Admin Request Tab State ──
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

  const otpForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── OTP Tab: Submit ──
  const onOtpSubmit = async (data: EmailForm) => {
    try {
      setIsOtpLoading(true);
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsOtpSubmitted(true);
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setIsOtpLoading(true);
      await api.post('/auth/forgot-password', { email: submittedEmail });
      toast.success('Reset link resent!');
      setCountdown(60);
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ── Admin Request Tab: Submit ──
  const onRequestSubmit = async (data: RequestForm) => {
    try {
      setIsRequestLoading(true);
      await api.post('/auth/request-password-reset', {
        email: data.email,
        requestNote: data.requestNote,
      });
      setIsRequestSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsRequestLoading(false);
    }
  };

  // ── OTP Success State ──
  if (isOtpSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-forest to-brand-olive rounded-2xl flex items-center justify-center shadow-lg shadow-brand-forest/20">
              <Send className="w-9 h-9 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-forest mb-2">Check Your Inbox</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">We've sent a password reset link to:</p>
          <p className="text-brand-forest font-semibold text-base mb-6 bg-brand-sage/20 px-4 py-2 rounded-xl inline-block">
            {submittedEmail}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-amber-800 text-xs font-semibold mb-1">⏱ Link expires in 1 hour</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Check your spam/junk folder if you don't see it. The email comes from U-Turn4Nature.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={countdown > 0 || isOtpLoading}
            className="w-full py-3 rounded-xl border border-brand-sage/50 text-brand-forest font-medium text-sm hover:bg-brand-sage/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isOtpLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Reset Link'
            )}
          </button>

          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-forest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Admin Request Success State ──
  if (isRequestSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-9 h-9 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-forest mb-2">Request Submitted!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your password reset request has been sent to the admin. They will review it and send you a reset link on your registered email and WhatsApp.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6 space-y-2">
            <p className="text-blue-800 text-xs font-semibold">📋 What happens next?</p>
            <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
              <li>Admin will review your request</li>
              <li>You'll get a reset link on your email</li>
              <li>WhatsApp OTP will also be sent as backup</li>
              <li>Response usually within a few hours</li>
            </ul>
          </div>

          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-forest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Form ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={180} height={72} className="object-contain h-16 w-auto" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-brand-forest mb-1">Forgot Password?</h1>
          <p className="text-gray-500 text-sm">Choose how you'd like to reset your password.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            id="tab-otp"
            onClick={() => setActiveTab('otp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'otp'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            OTP / Email
          </button>
          <button
            id="tab-admin-request"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Request Admin
          </button>
        </div>

        {/* OTP Tab Content */}
        {activeTab === 'otp' && (
          <div className="space-y-5">
            <div className="bg-brand-sage/10 rounded-xl p-3 text-xs text-gray-600 flex gap-2">
              <Mail className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
              <span>Enter your registered email and we'll send a reset OTP + link to your email and WhatsApp.</span>
            </div>

            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    {...otpForm.register('email')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {otpForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{otpForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-forest/20"
              >
                {isOtpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Reset Link</>}
              </button>
            </form>
          </div>
        )}

        {/* Admin Request Tab Content */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex gap-2 border border-blue-200">
              <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>If you don't have access to your registered email or WhatsApp, submit a request to admin. They will verify and send you a reset link.</span>
            </div>

            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Your Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    {...requestForm.register('email')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {requestForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{requestForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Reason for Reset Request
                </label>
                <textarea
                  {...requestForm.register('requestNote')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm resize-none"
                  placeholder="E.g. I forgot my password and don't have access to my old email/phone. I can be verified by my PAN card XXXXX..."
                />
                {requestForm.formState.errors.requestNote && (
                  <p className="text-red-500 text-xs mt-1">{requestForm.formState.errors.requestNote.message}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">This helps admin verify your identity and approve the request.</p>
              </div>

              <button
                type="submit"
                disabled={isRequestLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {isRequestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldAlert className="w-4 h-4" /> Submit Request to Admin</>}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-forest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
