"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Zod Schema matches backend exactly
const registerSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, '10-digit Indian phone number'),
  password: z.string().min(8, 'Min 8 chars').regex(/[A-Z]/, '1 uppercase').regex(/[0-9]/, '1 number'),
  address: z.string().min(5, 'Required'),
  state: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode'),
  panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, '12-digit Aadhaar'),
  upiId: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  instagramProfile: z.string().optional().or(z.literal('')),
  experience: z.string().min(1, 'Required'),
  whyJoin: z.string().min(20, 'At least 20 chars'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const STEPS = [
  { id: 1, name: 'Personal Details' },
  { id: 2, name: 'Identity & Bank' },
  { id: 3, name: 'Experience' }
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['fullName', 'email', 'phone', 'password', 'address', 'state', 'city', 'pincode'];
    if (currentStep === 2) fieldsToValidate = ['panCard', 'aadhaarNumber', 'upiId', 'bankAccountNumber', 'ifscCode'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        // Save email so verify-email page knows where to send the OTP
        sessionStorage.setItem('pendingVerificationEmail', data.email);
        toast.success(res.data.message || 'Application submitted! Please verify your email.');
        setIsSuccess(true);
      }
    } catch (error: any) {
      const apiError = error.response?.data;
      if (apiError?.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
        apiError.errors.forEach((e: { field: string; message: string }) => {
          toast.error(`${e.field}: ${e.message}`);
        });
      } else {
        toast.error(apiError?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-beige relative">
        <div className="max-w-md p-8 glass-card rounded-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-brand-forest mx-auto mb-4" />
          <h2 className="text-2xl font-dm-serif text-brand-forest mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            We've sent an OTP to your email. Please verify your email address to complete the application process.
          </p>
          <button 
            onClick={() => router.push('/verify-email')}
            className="w-full bg-brand-forest text-white py-3 rounded-xl font-medium"
          >
            Verify Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-olive/10 rounded-full blur-3xl animate-float"></div>
      
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 md:p-8 relative z-10 mx-auto border border-white/50 shadow-xl">
        
        <div className="text-center mb-8">
          <h1 className="font-dm-serif text-3xl text-brand-forest">Join U-Turn4Nature</h1>
          <p className="text-brand-olive text-sm mt-2">Become a Partner In Charge (PIC)</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-forest -z-10 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
          
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step.id ? 'bg-brand-forest text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step.id}
              </div>
              <span className="text-xs mt-2 font-medium text-gray-600 hidden md:block">{step.name}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: Personal Details */}
          <div className={currentStep === 1 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" name="fullName" register={register} error={errors.fullName} />
              <InputField label="Email" name="email" type="email" register={register} error={errors.email} />
              <InputField label="Phone Number" name="phone" register={register} error={errors.phone} />
              <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
              <div className="md:col-span-2">
                <InputField label="Full Address" name="address" register={register} error={errors.address} />
              </div>
              <InputField label="City" name="city" register={register} error={errors.city} />
              <InputField label="State" name="state" register={register} error={errors.state} />
              <InputField label="Pincode" name="pincode" register={register} error={errors.pincode} />
            </div>
          </div>

          {/* STEP 2: Identity & Bank */}
          <div className={currentStep === 2 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="PAN Card Number" name="panCard" register={register} error={errors.panCard} />
              <InputField label="Aadhaar Number" name="aadhaarNumber" register={register} error={errors.aadhaarNumber} />
              <div className="md:col-span-2">
                <hr className="my-2 border-brand-sage/30" />
                <p className="text-sm font-medium text-brand-forest mb-4">Payment Details (Optional now, required for withdrawal)</p>
              </div>
              <InputField label="UPI ID" name="upiId" register={register} error={errors.upiId} />
              <div className="hidden md:block"></div>
              <InputField label="Bank Account Number" name="bankAccountNumber" register={register} error={errors.bankAccountNumber} />
              <InputField label="IFSC Code" name="ifscCode" register={register} error={errors.ifscCode} />
            </div>
          </div>

          {/* STEP 3: Experience */}
          <div className={currentStep === 3 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 gap-5">
              <InputField label="Instagram Profile URL (Optional)" name="instagramProfile" type="url" register={register} error={errors.instagramProfile} />
              
              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Your Experience in Sales/Marketing</label>
                <select 
                  {...register('experience')}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all"
                >
                  <option value="" className="text-gray-900">Select experience level</option>
                  <option value="Beginner (0-1 years)" className="text-gray-900">Beginner (0-1 years)</option>
                  <option value="Intermediate (1-3 years)" className="text-gray-900">Intermediate (1-3 years)</option>
                  <option value="Advanced (3+ years)" className="text-gray-900">Advanced (3+ years)</option>
                  <option value="Influencer / Creator" className="text-gray-900">Influencer / Content Creator</option>
                </select>
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-forest mb-1">Why do you want to join U-Turn4Nature?</label>
                <textarea 
                  {...register('whyJoin')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all resize-none"
                  placeholder="Tell us about yourself and why you're interested in our sustainable brand..."
                ></textarea>
                {errors.whyJoin && <p className="text-red-500 text-xs mt-1">{errors.whyJoin.message}</p>}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-brand-sage/20">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-2.5 rounded-xl text-brand-forest font-medium border border-brand-forest/30 hover:bg-brand-sage/10 transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
            ) : <div></div>}

            {currentStep < 3 ? (
              <button type="button" onClick={nextStep} className="px-8 py-2.5 rounded-xl bg-brand-forest text-white font-medium hover:bg-brand-forest/90 transition-colors flex items-center">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button type="submit" disabled={isLoading} className="px-8 py-2.5 rounded-xl bg-brand-gold text-white font-medium hover:bg-yellow-600 transition-colors flex items-center disabled:opacity-70">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                Submit Application
              </button>
            )}
          </div>

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

// Reusable Input Field Component
const InputField = ({ label, name, type = 'text', register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-brand-forest mb-1">{label}</label>
    <input 
      type={type}
      {...register(name)}
      className="w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-forest/50 transition-all"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);
