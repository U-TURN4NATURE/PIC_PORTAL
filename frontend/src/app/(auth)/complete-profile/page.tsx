"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Loader2, CheckCircle2, Leaf, Upload, X, FileText,
  CreditCard, Building, User, Briefcase, MapPin, ChevronRight
} from 'lucide-react';

// ─── Step 2 Schema ───────────────────────────────
const step2Schema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, '12-digit Aadhaar number required').optional().or(z.literal('')),
  panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  bankAccountName: z.string().min(2, 'Account holder name required'),
  bankName: z.string().min(2, 'Bank name required'),
  bankAccountNumber: z.string().min(8, 'Valid account number required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (e.g. SBIN0001234)'),
  branchName: z.string().min(2, 'Branch name required'),
  upiId: z.string().optional().or(z.literal('')),
});

// ─── Step 3 Schema ───────────────────────────────
const step3Schema = z.object({
  occupation: z.string().min(2, 'Occupation required'),
  yearsOfExperience: z.string().min(1, 'Required'),
  skills: z.string().min(2, 'List your key skills'),
  education: z.string().min(2, 'Education required'),
  whyJoin: z.string().min(20, 'At least 20 characters required'),
  preferredWorkingArea: z.string().min(2, 'Required'),
  preferredDistrict: z.string().min(2, 'District required'),
  preferredState: z.string().min(2, 'State required'),
  availability: z.string().min(1, 'Required'),
  instagramProfile: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

interface FileState {
  file: File | null;
  preview: string | null;
  name: string;
}

// ─── File Upload Component ────────────────────────
function FileUpload({
  label,
  accept,
  required,
  value,
  onChange,
  hint,
}: {
  label: string;
  accept: string;
  required?: boolean;
  value: FileState;
  onChange: (state: FileState) => void;
  hint?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ file, preview: e.target?.result as string, name: file.name });
    };
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      onChange({ file, preview: null, name: file.name });
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-brand-forest mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {value.file ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            {value.preview ? (
              <img src={value.preview} alt="" className="w-8 h-8 object-cover rounded" />
            ) : (
              <FileText className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{value.name}</p>
            <p className="text-xs text-green-600">Ready to upload</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ file: null, preview: null, name: '' })}
            className="p-1 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging ? 'border-brand-forest bg-brand-forest/5' : 'border-brand-sage/50 hover:border-brand-forest/50 hover:bg-brand-sage/5'
          }`}
        >
          <input
            type="file"
            accept={accept}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload className="w-8 h-8 text-brand-olive mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            <span className="text-brand-forest font-medium">Click to upload</span> or drag & drop
          </p>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────
export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  const [aadhaarFile, setAadhaarFile] = useState<FileState>({ file: null, preview: null, name: '' });
  const [panFile, setPanFile] = useState<FileState>({ file: null, preview: null, name: '' });
  const [resumeFile, setResumeFile] = useState<FileState>({ file: null, preview: null, name: '' });

  const form2 = useForm<Step2Values>({ resolver: zodResolver(step2Schema), mode: 'onTouched' });
  const form3 = useForm<Step3Values>({ resolver: zodResolver(step3Schema), mode: 'onTouched' });

  const onSubmitStep2 = async (data: Step2Values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
      if (aadhaarFile.file) formData.append('aadhaarDocument', aadhaarFile.file);
      if (panFile.file) formData.append('panDocument', panFile.file);

      await api.post('/auth/complete-profile/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('KYC details saved! Now complete Step 3.');
      setStep2Done(true);
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save KYC details');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep3 = async (data: Step3Values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
      if (resumeFile.file) formData.append('resumeDocument', resumeFile.file);

      await api.post('/auth/complete-profile/experience', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile completed! Welcome to the PIC Portal! 🎉');
      await initAuth(); // Refresh user state
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-brand-forest text-white p-3 rounded-full shadow-lg">
              <Leaf className="w-7 h-7" />
            </div>
          </div>
          <h1 className="font-dm-serif text-3xl text-brand-forest">Complete Your Profile</h1>
          <p className="text-brand-olive text-sm mt-2">You&apos;re approved! Complete your KYC to start earning.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[
            { step: 1, label: 'Registration', done: true },
            { step: 2, label: 'KYC & Bank', done: step2Done },
            { step: 3, label: 'Experience', done: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                s.done ? 'bg-green-100 text-green-700 border border-green-200' :
                currentStep === s.step ? 'bg-brand-forest text-white shadow-md' :
                'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center">{s.step}</span>}
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/50 shadow-xl">
          {/* ─── STEP 2: KYC & Bank ─── */}
          {currentStep === 2 && (
            <form onSubmit={form2.handleSubmit(onSubmitStep2)} className="space-y-6">
              {/* Identity */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Identity Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Aadhaar Number (Optional)" error={form2.formState.errors.aadhaarNumber?.message}>
                    <input {...form2.register('aadhaarNumber')} placeholder="123456789012" className={inputClass} maxLength={12} />
                  </Field>
                  <Field label="PAN Number (Optional)" error={form2.formState.errors.panCard?.message}>
                    <input {...form2.register('panCard')} placeholder="ABCDE1234F" className={`${inputClass} uppercase`} maxLength={10} />
                  </Field>
                </div>
              </section>

              {/* Document Uploads */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Document Uploads</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload
                    label="Aadhaar Card (Optional)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={aadhaarFile}
                    onChange={setAadhaarFile}
                    hint="PDF, JPG, JPEG, PNG — Max 5MB"
                  />
                  <FileUpload
                    label="PAN Card (Optional)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={panFile}
                    onChange={setPanFile}
                    hint="PDF, JPG, JPEG, PNG — Max 5MB"
                  />
                </div>
              </section>

              <hr className="border-brand-sage/30" />

              {/* Bank Details */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Bank Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Account Holder Name" error={form2.formState.errors.bankAccountName?.message}>
                    <input {...form2.register('bankAccountName')} placeholder="John Doe" className={inputClass} />
                  </Field>
                  <Field label="Bank Name" error={form2.formState.errors.bankName?.message}>
                    <input {...form2.register('bankName')} placeholder="State Bank of India" className={inputClass} />
                  </Field>
                  <Field label="Account Number" error={form2.formState.errors.bankAccountNumber?.message}>
                    <input {...form2.register('bankAccountNumber')} placeholder="1234567890" className={inputClass} />
                  </Field>
                  <Field label="IFSC Code" error={form2.formState.errors.ifscCode?.message}>
                    <input {...form2.register('ifscCode')} placeholder="SBIN0001234" className={`${inputClass} uppercase`} />
                  </Field>
                  <Field label="Branch Name" error={form2.formState.errors.branchName?.message}>
                    <input {...form2.register('branchName')} placeholder="Connaught Place" className={inputClass} />
                  </Field>
                  <Field label="UPI ID (Optional)" error={form2.formState.errors.upiId?.message}>
                    <input {...form2.register('upiId')} placeholder="yourname@upi" className={inputClass} />
                  </Field>
                </div>
              </section>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-forest text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-forest/90 transition-all disabled:opacity-70 shadow-lg shadow-brand-forest/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                {isLoading ? 'Saving...' : 'Save & Continue to Step 3'}
              </button>
            </form>
          )}

          {/* ─── STEP 3: Experience ─── */}
          {currentStep === 3 && (
            <form onSubmit={form3.handleSubmit(onSubmitStep3)} className="space-y-6">
              {/* Professional Info */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Professional Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Occupation" error={form3.formState.errors.occupation?.message}>
                    <input {...form3.register('occupation')} placeholder="Sales Executive, Teacher, etc." className={inputClass} />
                  </Field>
                  <Field label="Years of Experience" error={form3.formState.errors.yearsOfExperience?.message}>
                    <select {...form3.register('yearsOfExperience')} className={inputClass}>
                      <option value="">Select experience</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </Field>
                  <Field label="Education" error={form3.formState.errors.education?.message}>
                    <select {...form3.register('education')} className={inputClass}>
                      <option value="">Select education</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Availability" error={form3.formState.errors.availability?.message}>
                    <select {...form3.register('availability')} className={inputClass}>
                      <option value="">Select availability</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Weekends Only">Weekends Only</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Key Skills" error={form3.formState.errors.skills?.message}>
                      <input {...form3.register('skills')} placeholder="Sales, Marketing, Social Media, Communication..." className={inputClass} />
                    </Field>
                  </div>
                </div>
              </section>

              <hr className="border-brand-sage/30" />

              {/* PIC Related */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">PIC Details</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Why do you want to become a PIC?" error={form3.formState.errors.whyJoin?.message}>
                    <textarea
                      {...form3.register('whyJoin')}
                      rows={3}
                      placeholder="Tell us about your motivation and how you plan to contribute to U-Turn4Nature's mission..."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Preferred Working Area" error={form3.formState.errors.preferredWorkingArea?.message}>
                      <input {...form3.register('preferredWorkingArea')} placeholder="Local area, city, etc." className={inputClass} />
                    </Field>
                    <Field label="Preferred District" error={form3.formState.errors.preferredDistrict?.message}>
                      <input {...form3.register('preferredDistrict')} placeholder="District name" className={inputClass} />
                    </Field>
                    <Field label="State" error={form3.formState.errors.preferredState?.message}>
                      <select {...form3.register('preferredState')} className={inputClass}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Instagram Profile (Optional)" error={form3.formState.errors.instagramProfile?.message}>
                      <input {...form3.register('instagramProfile')} placeholder="https://instagram.com/yourprofile" className={inputClass} />
                    </Field>
                  </div>
                </div>
              </section>

              <hr className="border-brand-sage/30" />

              {/* Resume Upload */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-semibold text-brand-forest uppercase tracking-wide">Resume (Optional)</h2>
                </div>
                <FileUpload
                  label="Upload Resume"
                  accept=".pdf,.doc,.docx"
                  value={resumeFile}
                  onChange={setResumeFile}
                  hint="PDF, DOC, DOCX — Max 5MB"
                />
              </section>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl border border-brand-forest/30 text-brand-forest font-medium hover:bg-brand-sage/10 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-brand-gold hover:bg-yellow-500 text-gray-900 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isLoading ? 'Completing Profile...' : 'Complete Profile & Start Earning 🚀'}
                </button>
              </div>
            </form>
          )}
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
