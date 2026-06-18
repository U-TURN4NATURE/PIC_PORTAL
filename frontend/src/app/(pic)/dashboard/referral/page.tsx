"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  UserPlus, Users, Phone, Mail, Flag, CheckCircle2,
  Clock, TrendingUp, XCircle, Star, RefreshCw, ChevronDown, X, Search
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
  handledBy?: 'PIC' | 'U_TURN_NATURE';
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
  const [activeTab, setActiveTab] = useState<'add' | 'my-referrals' | 'uturn-referrals' | 'follow-ups'>('add');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [followUpModal, setFollowUpModal] = useState<Referral | null>(null);

  // Add Referral Form State
  const [form, setForm] = useState({ personName: '', personPhone: '', personEmail: '', handledBy: '' });
  const [submitting, setSubmitting] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Search + Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | ''>('');

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
      setForm({ personName: '', personPhone: '', personEmail: '', handledBy: '' });
      fetchReferrals();
      setActiveTab('my-referrals');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add referral');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBulkUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map(r => r.trim()).filter(r => r);
      if (rows.length < 2) throw new Error('File is empty or missing data rows');
      
      const referrals = [];
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        // Simple CSV parse handling commas
        const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2 && cols[0] && cols[1]) {
          referrals.push({
            personName: cols[0],
            personPhone: cols[1],
            personEmail: cols[2] || undefined,
            handledBy: cols[3]?.toLowerCase().includes('pic') ? 'PIC' : 'U_TURN_NATURE'
          });
        }
      }
      
      if (referrals.length === 0) throw new Error('No valid referrals found in file');
      
      const res = await api.post('/pic/referrals/bulk', { referrals });
      toast.success(`Successfully uploaded ${res.data.count} referrals!`);
      fetchReferrals();
      setActiveTab('my-referrals');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload bulk referrals');
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Phone,Email,Handled By (PIC or U-Turn)\nRahul Sharma,9876543210,rahul@example.com,PIC\nAnita Verma,9123456789,anita@example.com,U-Turn";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "referral_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateHandledBy = async (referralId: string, newHandledBy: string) => {
    try {
      await api.patch(`/pic/referrals/${referralId}/handled-by`, { handledBy: newHandledBy });
      toast.success('Follow-up assignment updated');
      fetchReferrals();
    } catch (err) {
      toast.error('Failed to update follow-up assignment');
    }
  };

  // Filtered referrals derived from search + status filter
  const filteredReferrals = useMemo(() => {
    const handledByFilter = activeTab === 'my-referrals' ? 'PIC' : 'U_TURN_NATURE';
    return referrals
      .filter(r => r.handledBy === handledByFilter)
      .filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.personName.toLowerCase().includes(q) ||
          r.personPhone.includes(q) ||
          (r.personEmail?.toLowerCase().includes(q) ?? false)
        );
      })
      .filter(r => {
        if (!statusFilter) return true;
        return r.status === statusFilter;
      });
  }, [referrals, activeTab, searchQuery, statusFilter]);


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
          { key: 'my-referrals', label: `Follow by Me (${referrals.filter(r => r.handledBy === 'PIC').length})`, icon: <Users className="w-4 h-4" /> },
          { key: 'uturn-referrals', label: `Follow by U-Turn (${referrals.filter(r => r.handledBy === 'U_TURN_NATURE').length})`, icon: <Flag className="w-4 h-4" /> },
          { key: 'follow-ups', label: `Follow-up Requests (${followUps.length})`, icon: <TrendingUp className="w-4 h-4" /> },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handled By <span className="text-red-500">*</span></label>
                <select
                  value={form.handledBy}
                  onChange={e => setForm(f => ({ ...f, handledBy: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  required
                >
                  <option value="" disabled>Select who will follow up</option>
                  <option value="U_TURN_NATURE">Followed up by U-Turn4Nature</option>
                  <option value="PIC">Followed up by Me (PIC)</option>
                </select>
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

          <div className="bg-white border border-brand-sage/30 rounded-2xl p-8 shadow-sm h-fit max-w-lg">
            <h2 className="text-xl font-semibold text-brand-forest mb-1">Bulk Upload</h2>
            <p className="text-sm text-gray-500 mb-6">Upload multiple referrals at once using a CSV file.</p>
            
            <div className="space-y-4">
              <button 
                onClick={downloadTemplate}
                className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                📥 Download CSV Template
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleBulkUpload}
                  disabled={bulkUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`w-full ${bulkUploading ? 'bg-gray-100' : 'bg-brand-forest hover:bg-brand-olive'} text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 pointer-events-none`}>
                  {bulkUploading ? <RefreshCw className="w-4 h-4 animate-spin text-gray-500" /> : <Users className="w-4 h-4" />}
                  {bulkUploading ? <span className="text-gray-500">Uploading...</span> : 'Upload CSV File'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Referrals Lists */}
      {(activeTab === 'my-referrals' || activeTab === 'uturn-referrals') && (
        <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">

          {/* Search + Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ReferralStatus | '')}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 bg-white text-gray-700"
            >
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_CONFIG) as ReferralStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            {(searchQuery || statusFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{filteredReferrals.length} result{filteredReferrals.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading referrals...</div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {searchQuery || statusFilter ? 'No referrals match your search' : 'No referrals found'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || statusFilter
                  ? 'Try clearing your filters to see all referrals.'
                  : `You don't have any referrals assigned to ${activeTab === 'my-referrals' ? 'you' : 'U-Turn Nature'}.`
                }
              </p>
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
                  {filteredReferrals.map(ref => {
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
                          ) : ref.handledBy === 'PIC' ? (
                            <select
                              value={ref.handledBy}
                              onChange={(e) => handleUpdateHandledBy(ref.id, e.target.value)}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-blue-50 text-blue-700"
                            >
                              <option value="PIC">Handled by Me</option>
                              <option value="U_TURN_NATURE">Handled by U-Turn</option>
                            </select>
                          ) : (
                            <div className="flex flex-col gap-2 items-center">
                              <button
                                onClick={() => handleUpdateHandledBy(ref.id, 'PIC')}
                                className="w-full inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                              >
                                <UserPlus className="w-3 h-3" /> Follow by Me
                              </button>
                              <button
                                onClick={() => setFollowUpModal(ref)}
                                className="w-full inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Flag className="w-3 h-3" /> Follow by U-Turn
                              </button>
                            </div>
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
