"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { User, Phone, Mail, MapPin, CreditCard, Building2, Instagram, Loader2, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        setForm({
          upiId: data.upiId || '',
          bankAccountNumber: data.bankAccountNumber || '',
          ifscCode: data.ifscCode || '',
          instagramProfile: data.instagramProfile || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.patch('/pic/profile', form);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-white rounded-2xl border border-brand-sage/20" />
      <div className="h-64 bg-white rounded-2xl border border-brand-sage/20" />
    </div>;
  }

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 py-3 border-b border-brand-sage/10 last:border-0">
      <div className="p-1.5 bg-brand-forest/5 rounded-lg mt-0.5">
        <Icon className="w-4 h-4 text-brand-forest" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">My Profile</h1>
        <p className="text-gray-500">View your details and update payment information.</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-brand-forest to-brand-olive rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-dm-serif font-bold border-2 border-white/30 shrink-0">
          {profile?.fullName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-dm-serif font-bold">{profile?.fullName}</h2>
          <p className="text-white/70 text-sm mt-0.5">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              profile?.status === 'APPROVED' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
              profile?.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
              'bg-gray-500/20 text-gray-200 border-gray-400/30'
            }`}>{profile?.status}</span>
            {profile?.isEmailVerified && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Email Verified
              </span>
            )}
          </div>
        </div>
        {profile?.referralCode && (
          <div className="ml-auto text-right">
            <p className="text-white/60 text-xs">Referral Code</p>
            <p className="text-brand-gold font-dm-serif text-2xl font-bold tracking-widest">{profile.referralCode}</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info (read-only) */}
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-forest" /> Personal Information
          </h3>
          <InfoRow icon={User} label="Full Name" value={profile?.fullName} />
          <InfoRow icon={Mail} label="Email" value={profile?.email} />
          <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
          <InfoRow icon={CreditCard} label="PAN Card" value={profile?.panCard ? `${profile.panCard.slice(0, 2)}***${profile.panCard.slice(-2)}` : '—'} />
          <InfoRow icon={CreditCard} label="Aadhaar" value={profile?.aadhaarNumber ? `XXXX-XXXX-${profile.aadhaarNumber.slice(-4)}` : '—'} />
        </div>

        {/* KYC Status */}
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-forest" /> Address
          </h3>
          <InfoRow icon={MapPin} label="Address" value={profile?.address} />
          <InfoRow icon={MapPin} label="City" value={profile?.city} />
          <InfoRow icon={MapPin} label="State" value={profile?.state} />
          <InfoRow icon={MapPin} label="Pincode" value={profile?.pincode} />
          <InfoRow icon={Instagram} label="Instagram" value={profile?.instagramProfile} />
        </div>
      </div>

      {/* Editable: Payment Details */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-sage/20">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-forest" /> Payment Details
            <span className="text-xs text-gray-400 font-normal ml-1">(Editable)</span>
          </h3>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-5">
          {[
            { field: 'upiId', label: 'UPI ID', placeholder: 'yourname@upi' },
            { field: 'instagramProfile', label: 'Instagram Profile URL', placeholder: 'https://instagram.com/...' },
            { field: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'Enter account number' },
            { field: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                value={form[field] || ''}
                onChange={e => setForm((f: any) => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm"
              />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-forest text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-forest/90 transition-colors disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
