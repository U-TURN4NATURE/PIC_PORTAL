"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Copy, CheckCircle2, ExternalLink, Share2, QrCode, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ReferralPage() {
  const { user } = useAuthStore();
  const [referral, setReferral] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    api.get('/pic/referral')
      .then(res => setReferral(res.data.data))
      .catch(() => toast.error('Failed to load referral info'))
      .finally(() => setIsLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referral?.referralLink || '');
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referral?.referralCode || '');
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join U-Turn4Nature!',
        text: 'Shop sustainable organic products using my referral link:',
        url: referral?.referralLink,
      });
    } else {
      copyLink();
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-brand-sage/20" />)}
    </div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Your Referral Link</h1>
        <p className="text-gray-500">Share this link to earn 5% commission on every successful order.</p>
      </div>

      {/* Main Link Card */}
      <div className="bg-gradient-to-br from-brand-forest to-brand-olive rounded-2xl p-8 text-white shadow-xl shadow-brand-forest/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold font-semibold text-sm">Active • 5% Commission</span>
          </div>
          <p className="text-white/70 text-sm mb-3">Your unique referral link</p>
          <div className="bg-black/20 rounded-xl px-4 py-3 font-mono text-sm text-white break-all border border-white/10 mb-4">
            {referral?.referralLink || 'Loading...'}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={copyLink} className="flex items-center gap-2 bg-white text-brand-forest font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-beige transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={shareLink} className="flex items-center gap-2 bg-brand-gold text-gray-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <a href={referral?.referralLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              <ExternalLink className="w-4 h-4" /> Preview
            </a>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Your Referral Code</p>
          <p className="text-3xl font-dm-serif font-bold text-brand-forest tracking-widest">{referral?.referralCode}</p>
          <p className="text-xs text-gray-400 mt-1">Customers can enter this at checkout</p>
        </div>
        <button onClick={copyCode} className="flex items-center gap-2 bg-brand-forest/10 text-brand-forest font-semibold px-5 py-3 rounded-xl hover:bg-brand-forest/20 transition-colors">
          {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedCode ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-brand-forest">{referral?.stats?.totalOrders ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Orders via your link</p>
        </div>
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-brand-gold">{formatCurrency(referral?.stats?.totalCommission ?? 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Commission Earned</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-brand-beige border border-brand-sage/20 rounded-2xl p-6">
        <h3 className="font-semibold text-brand-forest mb-3">💡 Tips to maximize your earnings</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><span className="text-brand-gold mt-0.5">•</span> Share on WhatsApp, Instagram, and Facebook with a personal recommendation</li>
          <li className="flex items-start gap-2"><span className="text-brand-gold mt-0.5">•</span> Create content about U-Turn4Nature's sustainable products and include your link</li>
          <li className="flex items-start gap-2"><span className="text-brand-gold mt-0.5">•</span> Add your referral code in your Instagram/YouTube bio</li>
          <li className="flex items-start gap-2"><span className="text-brand-gold mt-0.5">•</span> Commission is tracked when customers purchase within 30 days of clicking your link</li>
        </ul>
      </div>
    </div>
  );
}
