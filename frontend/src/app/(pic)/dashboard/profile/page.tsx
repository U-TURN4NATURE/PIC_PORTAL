"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import {
  User, Phone, Mail, MapPin, CreditCard, Building2,
  Link, Loader2, Save, CheckCircle2, Camera, Upload, X,
} from 'lucide-react';
import Image from 'next/image';
import { State, City } from 'country-state-city';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const indianStates = State.getStatesOfCountry('IN');

export default function ProfilePage() {
  const { user, initAuth } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const selectedStateObj = indianStates.find(s => s.name === form.state);
  const cityOptions = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];

  // Profile image state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      const data = res.data.data;
      setProfile(data);
      setForm((prev: any) => ({
        ...prev,
        upiId: data.upiId || '',
        bankAccountNumber: data.bankAccountNumber || '',
        ifscCode: data.ifscCode || '',
        bankAccountName: data.bankAccountName || '',
        bankName: data.bankName || '',
        branchName: data.branchName || '',
        instagramProfile: data.instagramProfile || '',
        facebookProfile: data.facebookProfile || '',
        linkedinProfile: data.linkedinProfile || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        gender: data.gender || '',
      }));
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.patch('/pic/profile', form);
      toast.success('Profile updated successfully!');
      await fetchProfile(); // refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Profile Image Handlers ──────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WEBP image');
      return;
    }
    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    // Client-side compression
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 500;
        let { width, height } = img;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            setSelectedFile(compressedFile);
            setPreviewUrl(URL.createObjectURL(compressedFile));
          }
        }, 'image/webp', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', selectedFile);
      const res = await api.post('/pic/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newImageUrl = res.data.data?.profileImage;
      setProfile((prev: any) => ({ ...prev, profileImage: newImageUrl }));
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Profile image updated!');
      // Refresh auth store so layout avatar updates too
      initAuth();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getProfileImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (profile?.profileImage) {
      // If it's already a full URL (Cloudinary), use it directly
      if (profile.profileImage.startsWith('http')) return profile.profileImage;
      return `${BACKEND_URL}${profile.profileImage}`;
    }
    return null;
  };

  // ───────────────────────────────────────────────

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

  const imageSrc = getProfileImageSrc();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">My Profile</h1>
        <p className="text-gray-500">View your details and update payment information.</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-brand-forest to-brand-olive rounded-2xl p-6 text-white flex items-center gap-5">
        {/* Avatar with upload overlay */}
        <div className="relative shrink-0 group">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-4xl font-dm-serif font-bold text-white">
                {profile?.fullName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Camera overlay on hover */}
          <button
            id="change-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Change profile photo"
          >
            <Camera className="w-5 h-5 text-white" />
            <span className="text-[9px] text-white font-medium mt-0.5">Change</span>
          </button>

          <input
            ref={fileInputRef}
            id="profile-image-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-dm-serif font-bold">{profile?.fullName}</h2>
          <p className="text-white/70 text-sm mt-0.5">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
          <div className="ml-auto text-right shrink-0">
            <p className="text-white/60 text-xs">ID</p>
            <p className="text-brand-gold font-dm-serif text-2xl font-bold tracking-widest">{profile.referralCode}</p>
          </div>
        )}
      </div>

      {/* Image preview / upload confirm bar */}
      {selectedFile && (
        <div className="bg-white border border-brand-forest/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-forest/20 shrink-0">
            {previewUrl && (
              <Image src={previewUrl} alt="Preview" width={48} height={48} className="w-full h-full object-cover" unoptimized />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to upload</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="cancel-avatar-btn"
              onClick={handleCancelPreview}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              id="upload-avatar-btn"
              onClick={handleImageUpload}
              disabled={isUploadingImage}
              className="flex items-center gap-2 px-4 py-2 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest/90 transition-colors disabled:opacity-60"
            >
              {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploadingImage ? 'Uploading...' : 'Save Photo'}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info (read-only with editable gender) */}
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-forest" /> Personal Information
            </h3>
            <span className="text-xs text-gray-400 font-normal ml-1">(Gender is Editable)</span>
          </div>
          <InfoRow icon={User} label="Full Name" value={profile?.fullName} />
          <InfoRow icon={Mail} label="Email" value={profile?.email} />
          <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
          
          {/* Editable Gender Field */}
          <div className="flex items-center gap-3 py-3 border-b border-brand-sage/10 last:border-0">
            <div className="p-1.5 bg-brand-forest/5 rounded-lg shrink-0">
              <User className="w-4 h-4 text-brand-forest" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender || ''}
                onChange={e => setForm((f: any) => ({ ...f, gender: e.target.value }))}
                className="w-full max-w-[200px] px-3 py-2 rounded-xl border border-brand-sage/50 text-gray-900 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <InfoRow icon={CreditCard} label="PAN Card" value={profile?.panCard ? `${profile.panCard.slice(0, 2)}***${profile.panCard.slice(-2)}` : '—'} />
          <InfoRow icon={CreditCard} label="Aadhaar" value={profile?.aadhaarNumber ? `XXXX-XXXX-${profile.aadhaarNumber.slice(-4)}` : '—'} />
        </div>

        {/* Address (Editable) */}
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-forest" /> Address
              <span className="text-xs text-gray-400 font-normal ml-1">(Editable)</span>
            </h3>
          </div>

          {/* Show current saved address if exists */}
          {(profile?.address || profile?.city || profile?.state) && (
            <div className="mb-4 p-3 bg-brand-sage/10 border border-brand-sage/30 rounded-xl">
              <p className="text-xs font-semibold text-brand-forest mb-1">📍 Current Saved Address</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* No address saved yet */}
          {!profile?.address && !profile?.city && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">⚠️ No address saved yet. Please fill in your address below.</p>
            </div>
          )}
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
              <input
                value={form.address || ''}
                onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))}
                placeholder="Enter your full address"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <select
                  value={form.state || ''}
                  onChange={e => {
                    setForm((f: any) => ({ ...f, state: e.target.value, city: '' }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm bg-white"
                >
                  <option value="">Select State</option>
                  {indianStates.map(s => (
                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <select
                  value={form.city || ''}
                  onChange={e => setForm((f: any) => ({ ...f, city: e.target.value }))}
                  disabled={!form.state}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm bg-white"
                >
                  <option value="">Select City</option>
                  {cityOptions.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-1/2 pr-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
              <input
                value={form.pincode || ''}
                onChange={e => setForm((f: any) => ({ ...f, pincode: e.target.value }))}
                placeholder="Pincode"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editable: Payment Details */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-sage/20 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-forest" /> Payment Details
            <span className="text-xs text-gray-400 font-normal ml-1">(Editable)</span>
          </h3>
          {profile?.pendingBankDetails && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Pending Admin Approval
            </span>
          )}
        </div>

        {profile?.pendingBankDetails && (
          <div className="p-4 mx-6 mt-6 bg-yellow-50/50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              Your requested bank details update is currently being reviewed by an admin. You cannot make further changes until it is approved or rejected.
            </p>
          </div>
        )}

        {/* Show current saved bank details if they exist */}
        {!profile?.pendingBankDetails && (profile?.bankAccountName || profile?.bankAccountNumber) && (
          <div className="px-6 pt-5">
            <div className="p-4 bg-brand-sage/10 border border-brand-sage/30 rounded-xl">
              <p className="text-xs font-semibold text-brand-forest mb-3">🏦 Current Saved Bank Details</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {profile?.bankAccountName && (
                  <div>
                    <p className="text-xs text-gray-400">Account Holder</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.bankAccountName}</p>
                  </div>
                )}
                {profile?.bankName && (
                  <div>
                    <p className="text-xs text-gray-400">Bank Name</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.bankName}</p>
                  </div>
                )}
                {profile?.bankAccountNumber && (
                  <div>
                    <p className="text-xs text-gray-400">Account Number</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {'•'.repeat(Math.max(0, profile.bankAccountNumber.length - 4))}{profile.bankAccountNumber.slice(-4)}
                    </p>
                  </div>
                )}
                {profile?.ifscCode && (
                  <div>
                    <p className="text-xs text-gray-400">IFSC Code</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.ifscCode}</p>
                  </div>
                )}
                {profile?.branchName && (
                  <div>
                    <p className="text-xs text-gray-400">Branch</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.branchName}</p>
                  </div>
                )}
                {profile?.upiId && (
                  <div>
                    <p className="text-xs text-gray-400">UPI ID</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.upiId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No bank details saved yet */}
        {!profile?.pendingBankDetails && !profile?.bankAccountName && !profile?.bankAccountNumber && (
          <div className="px-6 pt-5">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">⚠️ No bank details saved yet. Please fill in your bank information below.</p>
            </div>
          </div>
        )}

        <div className="p-6 grid md:grid-cols-2 gap-5">
          {[
            { field: 'upiId', label: 'UPI ID', placeholder: 'yourname@upi' },
            { field: 'bankAccountName', label: 'Bank Account Name', placeholder: 'Name on account' },
            { field: 'bankName', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
            { field: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'Enter account number' },
            { field: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
            { field: 'branchName', label: 'Branch Name', placeholder: 'e.g. New Delhi Branch' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                value={form[field] || ''}
                onChange={e => setForm((f: any) => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                disabled={!!profile?.pendingBankDetails}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-brand-sage/20">
          <div className="md:col-span-2 mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Link className="w-4 h-4 text-brand-forest" /> Social Media Profiles
              <span className="text-xs text-gray-400 font-normal ml-1">(Optional — Editable)</span>
            </h3>
          </div>

          {/* Show existing saved social profiles */}
          {(profile?.instagramProfile || profile?.facebookProfile || profile?.linkedinProfile) && (
            <div className="mb-5 p-4 bg-brand-sage/10 border border-brand-sage/30 rounded-xl">
              <p className="text-xs font-semibold text-brand-forest mb-3">🔗 Current Saved Profiles</p>
              <div className="flex flex-wrap gap-2">
                {profile?.instagramProfile && (
                  <a
                    href={profile.instagramProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
                  >
                    📸 Instagram
                  </a>
                )}
                {profile?.facebookProfile && (
                  <a
                    href={profile.facebookProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
                  >
                    👤 Facebook
                  </a>
                )}
                {profile?.linkedinProfile && (
                  <a
                    href={profile.linkedinProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
                  >
                    💼 LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {/* No social profiles yet */}
          {!profile?.instagramProfile && !profile?.facebookProfile && !profile?.linkedinProfile && (
            <div className="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-500">No social profiles saved yet. Add them below (all optional).</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { field: 'instagramProfile', label: '📸 Instagram Profile URL', placeholder: 'https://instagram.com/...' },
              { field: 'facebookProfile', label: '👤 Facebook Profile URL', placeholder: 'https://facebook.com/...' },
              { field: 'linkedinProfile', label: '💼 LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/...' },
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
