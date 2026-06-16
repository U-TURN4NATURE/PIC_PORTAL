"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const schema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

// Password strength checker
function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f97316' };
  if (score <= 3) return { score, label: 'Good', color: '#eab308' };
  if (score <= 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very Strong', color: '#16a34a' };
}

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const strength = getStrength(passwordValue);

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    try {
      setIsLoading(true);
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State ──
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse" />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-forest mb-2">Password Reset!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-forest/20"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
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
            <ShieldCheck className="w-6 h-6 text-brand-forest" />
          </div>
          <h1 className="text-2xl font-bold text-brand-forest mb-1">Create New Password</h1>
          <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-brand-forest mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all text-sm"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

            {/* Password strength bar */}
            {passwordValue.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background: i <= strength.score ? strength.color : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-brand-forest mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all text-sm"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password requirements checklist */}
          <div className="bg-brand-sage/10 rounded-xl p-4 space-y-1.5">
            {[
              { rule: /^.{8,}$/, label: 'At least 8 characters' },
              { rule: /[A-Z]/, label: 'One uppercase letter' },
              { rule: /[0-9]/, label: 'One number' },
            ].map(({ rule, label }) => {
              const passed = rule.test(passwordValue);
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${passed ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {passed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs transition-colors ${passed ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{label}</span>
                </div>
              );
            })}
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
                <ShieldCheck className="w-4 h-4" />
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-brand-forest transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
