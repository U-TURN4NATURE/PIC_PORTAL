"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2, ShieldAlert, MessageSquare, KeyRound, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// ─── Schemas ───
const otpRequestSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required'),
});

const otpResetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const tempPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  tempPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New Password must be at least 6 characters'),
});

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  requestNote: z.string().min(10, 'Please describe why you need to reset (min 10 characters)').max(500),
});

type TempPasswordForm = z.infer<typeof tempPasswordSchema>;
type RequestForm = z.infer<typeof requestSchema>;
type OTPRequestForm = z.infer<typeof otpRequestSchema>;
type OTPResetForm = z.infer<typeof otpResetSchema>;

type Tab = 'otp' | 'temp' | 'admin';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('otp');

  // ── OTP Tab State ──
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [userIdentifier, setUserIdentifier] = useState('');

  // ── Temp Password Tab State ──
  const [isTempLoading, setIsTempLoading] = useState(false);

  // ── Admin Request Tab State ──
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

  const tempForm = useForm<TempPasswordForm>({ resolver: zodResolver(tempPasswordSchema) });
  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });
  const otpRequestForm = useForm<OTPRequestForm>({ resolver: zodResolver(otpRequestSchema) });
  const otpResetForm = useForm<OTPResetForm>({ resolver: zodResolver(otpResetSchema) });

  // ── OTP Tab: Submit ──
  const onOtpRequestSubmit = async (data: OTPRequestForm) => {
    try {
      setIsOtpLoading(true);
      const res = await api.post('/auth/forgot-password', { identifier: data.identifier });
      setUserIdentifier(data.identifier);
      toast.success(res.data.message || 'OTP sent successfully!');
      setOtpStep('verify');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const onOtpResetSubmit = async (data: OTPResetForm) => {
    try {
      setIsOtpLoading(true);
      const res = await api.post('/auth/reset-password-otp', {
        identifier: userIdentifier,
        otp: data.otp,
        password: data.password,
      });
      toast.success(res.data.message || 'Password reset successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP or password.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ── Temp Password Tab: Submit ──
  const onTempSubmit = async (data: TempPasswordForm) => {
    try {
      setIsTempLoading(true);
      const res = await api.post('/auth/reset-password-with-temp', data);
      toast.success(res.data.message || 'Password reset successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or temporary password.');
    } finally {
      setIsTempLoading(false);
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
            Your password reset request has been sent to the admin. They will review it and provide you with a temporary password.
          </p>

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
            onClick={() => setActiveTab('otp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'otp'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            OTP
          </button>
          <button
            id="tab-temp"
            onClick={() => setActiveTab('temp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'temp'
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Temp Password
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
            {otpStep === 'request' ? (
              <>
                <div className="bg-brand-sage/10 rounded-xl p-3 text-xs text-gray-600 flex gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
                  <span>Receive an OTP via SMS and Email to securely reset your password.</span>
                </div>
                <form onSubmit={otpRequestForm.handleSubmit(onOtpRequestSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-forest mb-1">Email or Phone</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        {...otpRequestForm.register('identifier')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                        placeholder="hello@example.com or 9876543210"
                      />
                    </div>
                    {otpRequestForm.formState.errors.identifier && (
                      <p className="text-red-500 text-xs mt-1">{otpRequestForm.formState.errors.identifier.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isOtpLoading}
                    className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-forest/20 mt-2"
                  >
                    {isOtpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 flex gap-2 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>OTP sent! Please check your SMS and Email.</span>
                </div>
                <form onSubmit={otpResetForm.handleSubmit(onOtpResetSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-forest mb-1">Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      {...otpResetForm.register('otp')}
                      className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 text-center text-2xl font-bold tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all"
                      placeholder="------"
                    />
                    {otpResetForm.formState.errors.otp && (
                      <p className="text-red-500 text-xs mt-1 text-center">{otpResetForm.formState.errors.otp.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-forest mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        {...otpResetForm.register('password')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                        placeholder="Enter new password"
                      />
                    </div>
                    {otpResetForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{otpResetForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isOtpLoading}
                    className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-forest/20 mt-2"
                  >
                    {isOtpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Reset Password</>}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Temp Password Tab Content */}
        {activeTab === 'temp' && (
          <div className="space-y-5">
            <div className="bg-brand-sage/10 rounded-xl p-3 text-xs text-gray-600 flex gap-2">
              <KeyRound className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
              <span>Use the temporary password provided by the Admin to securely set a new password.</span>
            </div>

            <form onSubmit={tempForm.handleSubmit(onTempSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    {...tempForm.register('email')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                {tempForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{tempForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Temporary Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    {...tempForm.register('tempPassword')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                    placeholder="Enter temp password"
                  />
                </div>
                {tempForm.formState.errors.tempPassword && (
                  <p className="text-red-500 text-xs mt-1">{tempForm.formState.errors.tempPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    {...tempForm.register('newPassword')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 focus:border-transparent transition-all text-sm"
                    placeholder="Enter new password"
                  />
                </div>
                {tempForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{tempForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isTempLoading}
                className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-forest/20 mt-2"
              >
                {isTempLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Reset Password</>}
              </button>
            </form>
          </div>
        )}

        {/* Admin Request Tab Content */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex gap-2 border border-blue-200">
              <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Submit a request to the admin to get a temporary password if you forgot yours.</span>
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
                  placeholder="E.g. I forgot my password and need a temporary one to login."
                />
                {requestForm.formState.errors.requestNote && (
                  <p className="text-red-500 text-xs mt-1">{requestForm.formState.errors.requestNote.message}</p>
                )}
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
