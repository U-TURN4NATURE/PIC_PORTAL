"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Try to get email from sessionStorage (set during register)
    const savedEmail = sessionStorage.getItem('pendingVerificationEmail') || '';
    setEmail(savedEmail);
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    if (!email) {
      toast.error('Email not found. Please go back and register again.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/auth/verify-otp', { email, otp: otpString });
      if (res.data.success) {
        setIsVerified(true);
        sessionStorage.removeItem('pendingVerificationEmail');
        toast.success('Email verified successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please go back and register again.');
      return;
    }
    try {
      setIsResending(true);
      // Backend resends OTP via forgot-password-style resend endpoint
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4">
        <div className="w-full max-w-md p-8 glass-card rounded-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="font-dm-serif text-3xl text-brand-forest mb-3">Email Verified!</h1>
          <p className="text-gray-600 mb-2">
            Your email has been verified successfully.
          </p>
          <p className="text-sm text-brand-olive mb-8">
            Your application is now under review. We'll notify you at <strong>{email || 'your email'}</strong> once it's approved.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-brand-forest text-white py-3 rounded-xl font-medium hover:bg-brand-forest/90 transition-colors"
            >
              Go to Login
            </button>
            <Link href="/" className="block text-sm text-center text-brand-olive hover:text-brand-forest transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 glass-card rounded-2xl relative z-10">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-brand-forest/10 p-4 rounded-full">
            <Mail className="w-10 h-10 text-brand-forest" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-3xl text-brand-forest mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit OTP to
          </p>
          {email ? (
            <p className="font-semibold text-brand-forest mt-1 text-sm">{email}</p>
          ) : (
            <p className="text-brand-olive text-sm mt-1">your registered email address</p>
          )}
        </div>

        {/* Email input if not available */}
        {!email && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-brand-forest mb-1">Your Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all"
            />
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white text-gray-900 transition-all focus:outline-none
                ${digit ? 'border-brand-forest bg-brand-forest/5' : 'border-brand-sage/50'}
                focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-brand-forest font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-semibold text-brand-forest">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/register" className="text-sm text-gray-500 hover:text-brand-forest transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Registration
          </Link>
        </div>

      </div>
    </div>
  );
}
