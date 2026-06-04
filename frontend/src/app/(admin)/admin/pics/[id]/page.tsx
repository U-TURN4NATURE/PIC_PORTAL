"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { getFileUrl } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Tag,
  CheckCircle, XCircle, Ban, Trash2, Wallet, ShoppingCart,
  TrendingUp, Clock, Copy, ExternalLink, FileText, Download,
  CreditCard, Building, Briefcase, Eye, Users, Flag, IndianRupee,
  RefreshCw, X,
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Status Configs
// ─────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE:    { label: 'Active',         classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  APPROVED:  { label: 'Approved',       classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PENDING:   { label: 'Pending Review', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  REJECTED:  { label: 'Rejected',       classes: 'bg-red-500/10 text-red-400 border-red-500/30' },
  SUSPENDED: { label: 'Suspended',      classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

const REFERRAL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:       { label: 'Pending',       color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  CONTACTED:     { label: 'Contacted',     color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  INTERESTED:    { label: 'Interested',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  BUYING:        { label: 'Buying',        color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  NOT_BUYING:    { label: 'Not Buying',    color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ACTIVE_SELLER: { label: 'Active Seller', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  INACTIVE:      { label: 'Inactive',      color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const ALL_REFERRAL_STATUSES = ['PENDING','CONTACTED','INTERESTED','BUYING','NOT_BUYING','ACTIVE_SELLER','INACTIVE'];

// ─────────────────────────────────────────────────
// Document Preview Modal
// ─────────────────────────────────────────────────

// ─────────────────────────────────────────────────
// Document Preview Modal
// ─────────────────────────────────────────────────

function DocModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  const fullUrl = getFileUrl(url);
  // Detect type by file extension (most reliable)
  const isPdf = /\.pdf(\?|$)/i.test(url);
  const isImage = /\.(jpg|jpeg|png)(\?|$)/i.test(url);
  // For PDFs: use Google Docs Viewer to embed them (works with Cloudinary URLs)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-brand-sage/20 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-brand-sage/20 bg-gray-50">
          <p className="font-semibold text-gray-900">{label}</p>
          <div className="flex items-center gap-2">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <ExternalLink className="w-3 h-3" /> Open
            </a>
            <a href={fullUrl} download className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-gold text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              <Download className="w-3 h-3" /> Download
            </a>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-72px)]">
          {isImage ? (
            <div className="p-4">
              <img src={fullUrl} alt={label} className="max-w-full rounded-lg mx-auto" />
            </div>
          ) : isPdf ? (
            <iframe
              src={googleViewerUrl}
              className="w-full h-[75vh] border-0"
              title={label}
            />
          ) : (
            <div className="p-4">
              <iframe src={fullUrl} className="w-full h-[60vh] rounded-lg" title={label} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Manage Sales Modal
// ─────────────────────────────────────────────────
function SaleModal({ referral, onClose, onSuccess }: { referral: any; onClose: () => void; onSuccess: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [salesAmount, setSalesAmount] = useState('');
  const [commissionRate, setCommissionRate] = useState(String(referral.commissionRate || 5));
  const [loading, setLoading] = useState(false);
  const [editingSale, setEditingSale] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/admin/referrals/${referral.id}/sales/history`);
        setHistory(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load sale history');
      } finally { setLoadingHistory(false); }
    };
    fetchHistory();
  }, [referral.id]);

  const handleSubmit = async () => {
    if (!salesAmount) { toast.error('Enter a sale amount'); return; }
    setLoading(true);
    try {
      if (editingSale) {
        await api.patch(`/admin/referrals/sales/${editingSale.id}`, {
          saleAmount: parseFloat(salesAmount),
          commissionRate: parseFloat(commissionRate),
        });
        toast.success('Sale entry updated successfully!');
      } else {
        await api.patch(`/admin/referrals/${referral.id}/sales`, {
          salesAmount: parseFloat(salesAmount),
          commissionRate: parseFloat(commissionRate),
        });
        toast.success(`Commission credited to ${referral.pic?.fullName || 'PIC'}'s wallet!`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save sale');
    } finally { setLoading(false); }
  };

  const handleDeleteClick = async (saleId: string) => {
    if (!window.confirm('Are you sure you want to delete this sale entry? The commission will be deducted from the PIC wallet.')) return;
    setLoading(true);
    try {
      await api.delete(`/admin/referrals/sales/${saleId}`);
      toast.success('Sale entry deleted and wallet adjusted.');
      onSuccess();
      const res = await api.get(`/admin/referrals/${referral.id}/sales/history`);
      setHistory(res.data.data || []);
      if (editingSale?.id === saleId) cancelEdit();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete sale');
    } finally { setLoading(false); }
  };

  const handleEditClick = (sale: any) => {
    setEditingSale(sale);
    setSalesAmount(String(sale.saleAmount));
    setCommissionRate(String(sale.commissionRate));
  };

  const cancelEdit = () => {
    setEditingSale(null);
    setSalesAmount('');
    setCommissionRate(String(referral.commissionRate || 5));
  };

  const commission = salesAmount ? ((parseFloat(salesAmount) * parseFloat(commissionRate)) / 100).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-brand-sage/20 shadow-xl rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
          <div>
            <h3 className="text-brand-forest font-semibold">Manage Sales</h3>
            <p className="text-xs text-gray-500 mt-0.5">For: <span className="text-gray-900 font-medium">{referral.personName}</span></p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* History Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Sale History</h4>
          {loadingHistory ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm border border-gray-200 border-dashed rounded-xl bg-gray-50">No past sales found.</div>
          ) : (
            <div className="space-y-2">
              {history.map(sale => (
                <div key={sale.id} className="flex items-center justify-between bg-white border border-gray-200 shadow-sm p-3 rounded-xl">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">₹{sale.saleAmount.toFixed(0)} <span className="text-xs text-gray-500 font-normal">({sale.commissionRate}% comm.)</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(sale.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-brand-gold font-semibold text-sm">+₹{sale.commissionEarned.toFixed(2)}</p>
                    <button onClick={() => handleEditClick(sale)} className="text-xs text-blue-400 hover:text-blue-300 px-1">Edit</button>
                    <button onClick={() => handleDeleteClick(sale.id)} disabled={loading} className="text-xs text-red-400 hover:text-red-300 px-1">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center justify-between">
            {editingSale ? 'Edit Sale Entry' : 'Add New Sale Entry'}
            {editingSale && <button onClick={cancelEdit} className="text-xs text-blue-500 hover:text-blue-700 underline">Cancel Edit</button>}
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Sale Amount (₹) *</label>
            <input
              type="number" min="1"
              value={salesAmount}
              onChange={e => setSalesAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Commission Rate (%)</label>
            <input
              type="number" min="0" max="100"
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
            />
          </div>
          {salesAmount && (
            <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3 text-sm">
              <span className="text-gray-600 font-medium">{editingSale ? 'New Commission:' : 'Commission to credit:'} </span>
              <span className="text-brand-gold font-bold">₹{commission}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-brand-gold text-gray-900 rounded-xl text-sm font-semibold hover:bg-yellow-400 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              {editingSale ? 'Update Sale' : 'Credit Commission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────

export default function PICDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pic, setPic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<{ url: string; label: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals'>('overview');

  // Referrals state
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [saleModal, setSaleModal] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const fetchPIC = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/pics/${id}`);
      setPic(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch PIC details');
      router.push('/admin/pics');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  const fetchReferrals = useCallback(async () => {
    if (!id) return;
    setReferralsLoading(true);
    try {
      const res = await api.get(`/admin/referrals/pic/${id}`);
      setReferrals(res.data.referrals);
    } catch { toast.error('Failed to load referrals'); }
    finally { setReferralsLoading(false); }
  }, [id]);

  useEffect(() => { if (id) { fetchPIC(); fetchReferrals(); } }, [id, fetchPIC, fetchReferrals]);

  const handleUpdateStatus = async (referralId: string, status: string) => {
    setStatusUpdating(referralId);
    try {
      await api.patch(`/admin/referrals/${referralId}/status`, { status });
      toast.success('Status updated!');
      fetchReferrals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally { setStatusUpdating(null); }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'suspend') => {
    const reason = action !== 'approve' ? window.prompt(`Enter reason for ${action}:`) : '';
    if (action !== 'approve' && reason === null) return;
    try {
      setActionLoading(action);
      await api.patch(`/admin/pics/${id}/${action}`, { reason });
      toast.success(`PIC ${action}d successfully`);
      fetchPIC();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} PIC`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this PIC? This cannot be undone.')) return;
    try {
      setActionLoading('delete');
      await api.delete(`/admin/pics/${id}`);
      toast.success('PIC deleted');
      router.push('/admin/pics');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
      setActionLoading(null);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold" /></div>;
  if (!pic) return null;

  const status = statusConfig[pic.status] || { label: pic.status, classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };

  return (
    <div className="space-y-6">
      {/* Modals */}
      {docModal && <DocModal url={docModal.url} label={docModal.label} onClose={() => setDocModal(null)} />}

      {saleModal && (
        <SaleModal
          referral={saleModal}
          onClose={() => setSaleModal(null)}
          onSuccess={() => { fetchReferrals(); fetchPIC(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pics" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-dm-serif text-brand-forest">{pic.fullName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">Partner In Charge — Detail View</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pic.status === 'PENDING' && (
            <>
              <ActionBtn onClick={() => handleAction('approve')} loading={actionLoading === 'approve'} label="Approve" loadLabel="Approving…" icon={<CheckCircle className="w-4 h-4" />} cls="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" />
              <ActionBtn onClick={() => handleAction('reject')} loading={actionLoading === 'reject'} label="Reject" loadLabel="Rejecting…" icon={<XCircle className="w-4 h-4" />} cls="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" />
            </>
          )}
          {(pic.status === 'APPROVED' || pic.status === 'ACTIVE') && (
            <ActionBtn onClick={() => handleAction('suspend')} loading={actionLoading === 'suspend'} label="Suspend" loadLabel="Suspending…" icon={<Ban className="w-4 h-4" />} cls="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20" />
          )}
          <ActionBtn onClick={handleDelete} loading={actionLoading === 'delete'} label="Delete" loadLabel="Deleting…" icon={<Trash2 className="w-4 h-4" />} cls="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
          { key: 'referrals', label: `Referrals (${referrals.length})`, icon: <Users className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white text-brand-forest shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Profile + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-brand-forest/10 flex items-center justify-center text-2xl font-bold text-brand-forest border border-brand-sage/30">
                  {pic.fullName.charAt(0)}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full ${
                  pic.status === 'ACTIVE' ? 'badge-approved' :
                  pic.status === 'APPROVED' ? 'badge-approved opacity-80' :
                  pic.status === 'PENDING' ? 'badge-pending' :
                  pic.status === 'REJECTED' ? 'badge-rejected' :
                  'badge-suspended'
                }`}>{status.label}</span>
              </div>
              <div className="space-y-3">
                <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={pic.fullName} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={pic.email} badge={pic.isEmailVerified ? '✓ Verified' : '✗ Unverified'} badgeClass={pic.isEmailVerified ? 'text-green-400' : 'text-red-400'} onCopy={() => copy(pic.email, 'Email')} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={pic.phone} onCopy={() => copy(pic.phone, 'Phone')} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={`${pic.city}, ${pic.state} ${pic.pincode}`} />
                {pic.address && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={pic.address} />}
                {pic.referralCode && <InfoRow icon={<Tag className="w-4 h-4" />} label="Referral Code" value={pic.referralCode} valueClass="text-brand-gold font-mono font-bold" onCopy={() => copy(pic.referralCode, 'Referral code')} />}
                {pic.upiId && <InfoRow icon={<Wallet className="w-4 h-4" />} label="UPI ID" value={pic.upiId} onCopy={() => copy(pic.upiId, 'UPI ID')} />}
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
              <StatCard icon={<TrendingUp className="w-6 h-6 text-green-400" />} label="Total Earnings" value={formatCurrency(pic.wallet?.totalEarnings || 0)} bg="bg-green-500/5 border-green-500/20" />
              <StatCard icon={<Wallet className="w-6 h-6 text-brand-gold" />} label="Available Balance" value={formatCurrency(pic.wallet?.availableBalance || 0)} bg="bg-yellow-500/5 border-yellow-500/20" />
              <StatCard icon={<ShoppingCart className="w-6 h-6 text-blue-400" />} label="Total Orders" value={String(pic._count?.orders || 0)} bg="bg-blue-500/5 border-blue-500/20" />
              <StatCard icon={<Clock className="w-6 h-6 text-purple-400" />} label="Pending Earnings" value={formatCurrency(pic.wallet?.pendingEarnings || 0)} bg="bg-purple-500/5 border-purple-500/20" />
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Application Timeline</h2>
            <div className="flex flex-wrap gap-6">
              <TimelineItem icon={<Calendar className="w-4 h-4" />} label="Registered" value={pic.createdAt} />
              <TimelineItem icon={<CheckCircle className="w-4 h-4 text-green-400" />} label="Approved" value={pic.approvedAt} empty="Not yet approved" />
              <TimelineItem icon={<User className="w-4 h-4 text-blue-400" />} label="Profile Completed" value={pic.profileCompletedAt} empty="Not completed" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Status</p>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wider ${
                  pic.status === 'ACTIVE' ? 'badge-approved' :
                  pic.status === 'APPROVED' ? 'badge-approved opacity-80' :
                  pic.status === 'PENDING' ? 'badge-pending' :
                  pic.status === 'REJECTED' ? 'badge-rejected' :
                  'badge-suspended'
                }`}>{status.label}</span>
              </div>
            </div>
            {pic.rejectionReason && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                <p className="text-sm text-red-300">{pic.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* KYC Details */}
          {(pic.aadhaarNumber || pic.panCard || pic.bankName) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(pic.aadhaarNumber || pic.panCard) && (
                <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-brand-forest" />
                    <h2 className="text-base font-semibold text-gray-900">Identity (KYC)</h2>
                  </div>
                  <div className="space-y-3">
                    {pic.aadhaarNumber && <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Aadhaar" value={`XXXX XXXX ${pic.aadhaarNumber.slice(-4)}`} onCopy={() => copy(pic.aadhaarNumber, 'Aadhaar')} />}
                    {pic.panCard && <InfoRow icon={<CreditCard className="w-4 h-4" />} label="PAN" value={pic.panCard} onCopy={() => copy(pic.panCard, 'PAN')} />}
                  </div>
                </div>
              )}
              {pic.bankName && (
                <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-brand-forest" />
                    <h2 className="text-base font-semibold text-gray-900">Bank Details</h2>
                  </div>
                  <div className="space-y-3">
                    {pic.bankAccountName && <InfoRow icon={<User className="w-4 h-4" />} label="Account Holder" value={pic.bankAccountName} />}
                    {pic.bankName && <InfoRow icon={<Building className="w-4 h-4" />} label="Bank" value={`${pic.bankName}${pic.branchName ? ' — ' + pic.branchName : ''}`} />}
                    {pic.bankAccountNumber && <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Account No." value={`XXXX${pic.bankAccountNumber.slice(-4)}`} />}
                    {pic.ifscCode && <InfoRow icon={<Tag className="w-4 h-4" />} label="IFSC" value={pic.ifscCode} onCopy={() => copy(pic.ifscCode, 'IFSC')} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {(pic.aadhaarDocument || pic.panDocument || pic.resumeDocument) && (
            <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-5 h-5 text-brand-forest" />
                <h2 className="text-base font-semibold text-gray-900">Uploaded Documents</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pic.aadhaarDocument && <DocCard label="Aadhaar Document" url={pic.aadhaarDocument} onPreview={() => setDocModal({ url: pic.aadhaarDocument, label: 'Aadhaar Document' })} />}
                {pic.panDocument && <DocCard label="PAN Document" url={pic.panDocument} onPreview={() => setDocModal({ url: pic.panDocument, label: 'PAN Document' })} />}
                {pic.resumeDocument && <DocCard label="Resume" url={pic.resumeDocument} onPreview={() => setDocModal({ url: pic.resumeDocument, label: 'Resume' })} />}
              </div>
            </div>
          )}

          {/* Professional Info */}
          {(pic.occupation || pic.whyJoin) && (
            <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-brand-forest" />
                <h2 className="text-base font-semibold text-gray-900">Professional & PIC Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pic.occupation && <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Occupation" value={pic.occupation} />}
                {pic.yearsOfExperience && <InfoRow icon={<Clock className="w-4 h-4" />} label="Experience" value={pic.yearsOfExperience} />}
                {pic.education && <InfoRow icon={<User className="w-4 h-4" />} label="Education" value={pic.education} />}
                {pic.skills && <InfoRow icon={<Tag className="w-4 h-4" />} label="Skills" value={pic.skills} />}
                {pic.availability && <InfoRow icon={<Calendar className="w-4 h-4" />} label="Availability" value={pic.availability} />}
                {pic.preferredWorkingArea && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Working Area" value={`${pic.preferredWorkingArea}, ${pic.preferredDistrict || ''}`} />}
                {pic.instagramProfile && <InfoRow icon={<ExternalLink className="w-4 h-4" />} label="Instagram" value={pic.instagramProfile} />}
                {pic.whyJoin && (
                  <div className="md:col-span-2">
                    <InfoRow icon={<User className="w-4 h-4" />} label="Why they want to be a PIC" value={pic.whyJoin} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Payouts */}
          <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payouts</h2>
              <span className="text-xs text-gray-500">Last 5</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Requested</th>
                    <th className="px-6 py-3">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {!pic.payouts?.length ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payouts yet</td></tr>
                  ) : pic.payouts.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-gray-700">{p.paymentMethod || 'UPI'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${p.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : p.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(p.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-gray-500">{p.processedAt ? new Date(p.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REFERRALS TAB ── */}
      {activeTab === 'referrals' && (
        <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">People Referred by {pic.fullName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update status and manually enter sale amounts to credit commission to this PIC's wallet.</p>
          </div>
          {referralsLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : referrals.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals added by this PIC yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Person</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Sales</th>
                    <th className="px-6 py-3 text-right">Commission</th>
                    <th className="px-6 py-3">Follow-ups</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referrals.map((ref: any) => {
                    const sc = REFERRAL_STATUS_CONFIG[ref.status] || REFERRAL_STATUS_CONFIG.PENDING;
                    return (
                      <tr key={ref.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{ref.personName}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{new Date(ref.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-700 text-xs"><Phone className="w-3 h-3 text-gray-400" />{ref.personPhone}</div>
                          {ref.personEmail && <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5"><Mail className="w-3 h-3 text-gray-400" />{ref.personEmail}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={ref.status}
                            disabled={statusUpdating === ref.id}
                            onChange={e => handleUpdateStatus(ref.id, e.target.value)}
                            className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none ${sc.color}`}
                          >
                            {ALL_REFERRAL_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-white text-gray-900">{REFERRAL_STATUS_CONFIG[s]?.label || s}</option>
                            ))}
                          </select>
                          {ref.adminNotes && <p className="text-xs text-gray-500 mt-1 italic truncate max-w-[160px]">{ref.adminNotes}</p>}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-semibold">₹{ref.totalSalesAmount.toFixed(0)}</td>
                        <td className="px-6 py-4 text-right text-brand-gold font-bold">₹{ref.commissionAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {ref.followUpRequests?.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-full font-medium">
                              <Flag className="w-3 h-3" /> {ref.followUpRequests.length} request{ref.followUpRequests.length > 1 ? 's' : ''}
                            </span>
                          ) : <span className="text-gray-400 text-xs">None</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSaleModal(ref)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-forest/5 hover:bg-brand-forest/10 text-brand-forest border border-brand-forest/20 rounded-lg text-xs font-medium transition-colors shadow-sm"
                          >
                            <IndianRupee className="w-3 h-3" /> Add Sale
                          </button>
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
    </div>
  );
}

// ─── Sub Components ───────────────────────────────

function DocCard({ label, url, onPreview }: { label: string; url: string; onPreview: () => void }) {
  const isImage = /\.(jpg|jpeg|png)(\?|$)/i.test(url);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-brand-sage/30 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
          <FileText className="w-5 h-5 text-brand-forest" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{isImage ? 'Image' : 'Document'}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">
          <Eye className="w-3 h-3" /> Preview
        </button>
        <a href={getFileUrl(url)} download className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-brand-forest/5 hover:bg-brand-forest/10 text-brand-forest font-medium rounded-lg transition-colors border border-brand-forest/20">
          <Download className="w-3 h-3" /> Download
        </a>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, loading, label, loadLabel, icon, cls }: {
  onClick: () => void; loading: boolean; label: string; loadLabel: string; icon: React.ReactNode; cls: string;
}) {
  return (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${cls}`}>
      {icon} {loading ? loadLabel : label}
    </button>
  );
}

function InfoRow({ icon, label, value, badge, badgeClass, valueClass, onCopy }: {
  icon: React.ReactNode; label: string; value: string;
  badge?: string; badgeClass?: string; valueClass?: string; onCopy?: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm text-gray-900 font-medium break-all ${valueClass || ''}`}>{value}</p>
          {badge && <span className={`text-[10px] font-bold ${badgeClass}`}>{badge}</span>}
          {onCopy && (
            <button onClick={onCopy} className="text-gray-400 hover:text-brand-forest transition-colors">
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`bg-white shadow-sm border rounded-2xl p-5 flex items-start gap-4 ${bg}`}>
      <div className="p-2 rounded-xl bg-white/50 shadow-sm border border-black/5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ icon, label, value, empty }: { icon: React.ReactNode; label: string; value?: string; empty?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        {value ? (
          <p className="text-sm font-medium text-gray-900">{new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">{empty || '—'}</p>
        )}
      </div>
    </div>
  );
}
