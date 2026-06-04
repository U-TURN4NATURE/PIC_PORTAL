"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/admin/login', data);
      
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success('Admin login successful');
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      
      <div className="w-full max-w-md p-8 bg-gray-800 border border-gray-700 rounded-2xl relative z-10 mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 rounded-xl flex items-center justify-center">
              <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={220} height={80} className="object-contain" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Secure Access Only</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Email</label>
            <input 
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent transition-all"
              placeholder="admin@uturn4nature.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password"
              {...register('password')}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-gold hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Authenticate
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
