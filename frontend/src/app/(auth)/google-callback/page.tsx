"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, XCircle } from 'lucide-react';

// ─────────────────────────────────────────────────
// Google OAuth Success Page
// This page handles the redirect from the backend after Google OAuth.
// The backend passes a short-lived JWT via ?token= URL param.
// We call /auth/me to hydrate the session and store the user.
// ─────────────────────────────────────────────────

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMsg('No authentication token received. Please try again.');
        return;
      }

      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.data;
        setUser(user);
        toast.success(`Welcome, ${user.fullName || user.email}! 🎉`);

        if (user.status === 'ACTIVE') {
          router.replace('/dashboard');
        } else if (user.status === 'APPROVED' && !user.profileCompleted) {
          router.replace('/complete-profile');
        } else {
          router.replace('/dashboard');
        }
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Authentication failed. Please try again.';
        setStatus('error');
        setErrorMsg(msg);
        toast.error(msg);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-brand-forest text-white py-3 rounded-xl font-medium hover:bg-brand-forest/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-brand-forest animate-spin" />
        </div>
        <p className="text-brand-forest font-semibold text-lg">Signing you in with Google...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}

// ── Suspense wrapper required by Next.js for useSearchParams() ──
export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-forest animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}

