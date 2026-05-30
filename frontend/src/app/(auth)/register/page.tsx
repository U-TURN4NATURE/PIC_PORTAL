"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowRight, CheckCircle2, Leaf, MapPin, User, Lock, Phone, Mail, Home } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number'),
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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-brand-forest text-white p-3 rounded-full shadow-lg">
              <Leaf className="w-7 h-7" />
            </div>
          </div>
          <h1 className="font-dm-serif text-3xl text-brand-forest">Join U-Turn4Nature</h1>
          <p className="text-brand-olive text-sm mt-2">Become a Partner In Charge (PIC) and start earning</p>
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
                <input {...register('password')} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className={inputClass} />
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
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all text-sm";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-forest mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
