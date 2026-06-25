"use client";

import { useState } from 'react';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';

const kycSchema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, '12-digit Aadhaar number required'),
  panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
});

type KycValues = z.infer<typeof kycSchema>;

interface KycModalProps {
  onSuccess: () => void;
}

export default function KycModal({ onSuccess }: KycModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KycValues>({
    resolver: zodResolver(kycSchema),
  });

  const onSubmit = async (data: KycValues) => {
    try {
      setIsSubmitting(true);
      await api.patch('/pic/profile', data);
      toast.success('KYC details updated successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update KYC details');
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-forest focus:border-transparent outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[100] bg-brand-forest/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-forest to-brand-olive p-6 text-white shrink-0 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-brand-gold" />
            </div>
          </div>
          <h2 className="text-2xl font-dm-serif mb-2">Mandatory KYC Required</h2>
          <p className="text-brand-sage/90 text-sm">
            As per our policy, it is necessary to provide your PAN and Aadhaar numbers to continue using the portal.
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-brand-forest mb-1">
                Aadhaar Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('aadhaarNumber')}
                placeholder="123456789012"
                maxLength={12}
                className={inputClass}
              />
              {errors.aadhaarNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.aadhaarNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-forest mb-1">
                PAN Card Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('panCard')}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={inputClass}
                style={{ textTransform: 'uppercase' }}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
              />
              {errors.panCard && (
                <p className="mt-1 text-xs text-red-500">{errors.panCard.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-forest text-white font-semibold rounded-xl hover:bg-brand-forest/90 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isSubmitting ? 'Submitting...' : 'Submit Details'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
