"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  UserPlus, Users, Phone, Mail, Flag, CheckCircle2,
  Clock, TrendingUp, XCircle, Star, RefreshCw, ChevronDown, X
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
type ReferralStatus = 'PENDING' | 'CONTACTED' | 'INTERESTED' | 'BUYING' | 'NOT_BUYING' | 'ACTIVE_SELLER' | 'INACTIVE';
type FollowUpStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'DISMISSED';
type Priority = 'LOW' | 'NORMAL' | 'HIGH';

interface Referral {
  id: string;
  personName: string;
  personPhone: string;
  personEmail?: string;
  status: ReferralStatus;
  adminNotes?: string;
  totalSalesAmount: number;
  commissionAmount: number;
  createdAt: string;
  followUpRequests: { id: string; status: FollowUpStatus; priority: Priority; createdAt: string }[];
}

interface FollowUpRequest {
  id: string;
  reason: string;
  priority: Priority;
  status: FollowUpStatus;
  adminNotes?: string;
  createdAt: string;
  referral: { personName: string; personPhone: string; status: ReferralStatus };
}

// ─────────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────────
const STATUS_CONFIG: Record<ReferralStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:       { label: 'Pending',       color: 'bg-gray-100 text-gray-600',        icon: <Clock className="w-3 h-3" /> },
  CONTACTED:     { label: 'Contacted',     color: 'bg-blue-100 text-blue-700',        icon: <Phone className="w-3 h-3" /> },
  INTERESTED:    { label: 'Interested',    color: 'bg-yellow-100 text-yellow-700',    icon: <TrendingUp className="w-3 h-3" /> },
  BUYING:        { label: 'Buying',        color: 'bg-green-100 text-green-700',      icon: <CheckCircle2 className="w-3 h-3" /> },
  NOT_BUYING:    { label: 'Not Buying',    color: 'bg-red-100 text-red-600',          icon: <XCircle className="w-3 h-3" /> },
  ACTIVE_SELLER: { label: 'Active Seller', color: 'bg-purple-100 text-purple-700',   icon: <Star className="w-3 h-3" /> },
  INACTIVE:      { label: 'Inactive',      color: 'bg-slate-100 text-slate-500',      icon: <RefreshCw className="w-3 h-3" /> },
};

const FOLLOWUP_STATUS_COLOR: Record<FollowUpStatus, string> = {
  OPEN:        'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE:        'bg-green-100 text-green-700',
  DISMISSED:   'bg-gray-100 text-gray-500',
};

const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH:   'bg-red-100 text-red-700',
  NORMAL: 'bg-yellow-100 text-yellow-700',
  LOW:    'bg-green-100 text-green-700',
};

// ─────────────────────────────────────────────────
// Follow-Up Modal
// ─────────────────────────────────────────────────
function FollowUpModal({
  referral,
  onClose,
  onSuccess,
}: {
  referral: Referral;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { toast.error('Please enter a reason'); return; }
    setLoading(true);
    try {
      await api.post(`/pic/referrals/${referral.id}/followup`, { reason, priority });
      toast.success('Follow-up request submitted!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-brand-forest">Request Follow-up</h3>
            <p className="text-sm text-gray-500 mt-0.5">For: <span className="font-medium">{referral.personName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {(['LOW', 'NORMAL', 'HIGH'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    priority === p
                      ? p === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700'
                        : p === 'NORMAL' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p === 'HIGH' ? '🔴' : p === 'NORMAL' ? '🟡' : '🟢'} {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
            <textarea
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. He was interested in buying, please call him again..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-brand-forest text-white rounded-xl text-sm font-medium hover:bg-brand-olive disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────
export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'my-referrals' | 'follow-ups'>('add');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [followUpModal, setFollowUpModal] = useState<Referral | null>(null);

  // Add Referral Form State
  const [form, setForm] = useState({ personName: '', personPhone: '', personEmail: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const [refRes, statsRes] = await Promise.all([
        api.get('/pic/referrals'),
        api.get('/pic/referrals/stats'),
      ]);
      setReferrals(refRes.data.referrals);
      setStats(statsRes.data.data);
    } catch { toast.error('Failed to load referrals'); }
    finally { setLoading(false); }
  }, []);

  const fetchFollowUps = useCallback(async () => {
    try {
      const res = await api.get('/pic/followups');
      setFollowUps(res.data.requests);
    } catch { toast.error('Failed to load follow-ups'); }
  }, []);

  useEffect(() => {
    fetchReferrals();
    fetchFollowUps();
  }, [fetchReferrals, fetchFollowUps]);

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName.trim() || !form.personPhone.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/pic/referrals', form);
      toast.success(`${form.personName} added to your referrals!`);
      setForm({ personName: '', personPhone: '', personEmail: '' });
      fetchReferrals();
      setActiveTab('my-referrals');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add referral');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest">My Referrals</h1>
        <p className="text-gray-500 mt-1">Refer people, track their status, and earn commission on their purchases.</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Referred', value: stats.total, color: 'text-brand-forest' },
            { label: 'Buying', value: stats.statusBreakdown?.BUYING ?? 0, color: 'text-green-600' },
            { label: 'Total Sales', value: `₹${(stats.totalSales ?? 0).toFixed(0)}`, color: 'text-blue-600' },
            { label: 'Total Commission', value: `₹${(stats.totalCommission ?? 0).toFixed(2)}`, color: 'text-brand-gold' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-brand-sage/30 rounded-2xl p-4 shadow-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'add', label: 'Add Referral', icon: <UserPlus className="w-4 h-4" /> },
          { key: 'my-referrals', label: `All Referrals (${referrals.length})`, icon: <Users className="w-4 h-4" /> },
          { key: 'follow-ups', label: `Follow-up Requests (${followUps.length})`, icon: <Flag className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-brand-forest shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Add Referral */}
      {activeTab === 'add' && (
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-8 shadow-sm max-w-lg">
          <h2 className="text-xl font-semibold text-brand-forest mb-1">Add a New Referral</h2>
          <p className="text-sm text-gray-500 mb-6">Enter the details of the person you are referring.</p>
          <form onSubmit={handleAddReferral} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.personName}
                onChange={e => setForm(f => ({ ...f, personName: e.target.value }))}
                placeholder="e.g. Rahul Sharma"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.personPhone}
                  onChange={e => setForm(f => ({ ...f, personPhone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.personEmail}
                  onChange={e => setForm(f => ({ ...f, personEmail: e.target.value }))}
                  placeholder="rahul@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-forest text-white py-3 rounded-xl font-semibold hover:bg-brand-olive transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? 'Adding...' : 'Add Referral'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: My Referrals */}
      {activeTab === 'my-referrals' && (
        <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No referrals yet</p>
              <p className="text-gray-400 text-sm mt-1">Go to "Add Referral" tab to add your first referral.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Person</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sales</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commission</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {referrals.map(ref => {
                    const sc = STATUS_CONFIG[ref.status];
                    const latestFollowUp = ref.followUpRequests?.[0];
                    const hasOpenFollowUp = latestFollowUp?.status === 'OPEN' || latestFollowUp?.status === 'IN_PROGRESS';
                    return (
                      <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{ref.personName}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{new Date(ref.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{ref.personPhone}</div>
                          {ref.personEmail && <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><Mail className="w-3 h-3" />{ref.personEmail}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                          {ref.adminNotes && <p className="text-xs text-gray-400 mt-1 italic">"{ref.adminNotes}"</p>}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700">₹{ref.totalSalesAmount.toFixed(0)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-brand-gold">₹{ref.commissionAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          {hasOpenFollowUp ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${FOLLOWUP_STATUS_COLOR[latestFollowUp.status]}`}>
                              <Flag className="w-3 h-3" />
                              {latestFollowUp.status === 'OPEN' ? 'Requested' : 'In Progress'}
                            </span>
                          ) : (
                            <button
                              onClick={() => setFollowUpModal(ref)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Flag className="w-3 h-3" /> Request
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Follow-Up Requests */}
      {activeTab === 'follow-ups' && (
        <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
          {followUps.length === 0 ? (
            <div className="p-12 text-center">
              <Flag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No follow-up requests yet</p>
              <p className="text-gray-400 text-sm mt-1">You can request a follow-up from the "All Referrals" tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Person</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin Notes</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {followUps.map(fu => (
                    <tr key={fu.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{fu.referral.personName}</p>
                        <p className="text-gray-400 text-xs">{fu.referral.personPhone}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-600 text-xs leading-relaxed">{fu.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLOR[fu.priority]}`}>
                          {fu.priority === 'HIGH' ? '🔴' : fu.priority === 'NORMAL' ? '🟡' : '🟢'} {fu.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${FOLLOWUP_STATUS_COLOR[fu.status]}`}>
                          {fu.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs">{fu.adminNotes || '—'}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{new Date(fu.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpModal && (
        <FollowUpModal
          referral={followUpModal}
          onClose={() => setFollowUpModal(null)}
          onSuccess={() => { fetchReferrals(); fetchFollowUps(); }}
        />
      )}
    </div>
  );
}
