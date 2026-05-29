"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2, Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-forest/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-8 glass-card rounded-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-brand-forest text-white p-3 rounded-full">
              <Leaf className="w-8 h-8" />
            </div>
          </div>
          <h1 className="font-dm-serif text-3xl text-brand-forest">U-Turn4Nature</h1>
          <p className="text-brand-olive text-sm mt-2">Partner In Charge (PIC) Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
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

        <div className="mt-8 text-center text-sm text-gray-600">
          Want to become a PIC partner?{' '}
          <Link href="/register" className="text-brand-forest font-medium hover:underline">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
