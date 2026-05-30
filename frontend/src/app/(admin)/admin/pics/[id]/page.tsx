"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Tag,
  CheckCircle, XCircle, Ban, Trash2, Wallet, ShoppingCart,
  TrendingUp, Clock, Copy, ExternalLink, FileText, Download,
  CreditCard, Building, Briefcase, Eye,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE:    { label: 'Active',           classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  APPROVED:  { label: 'Approved',         classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  PENDING:   { label: 'Pending Review',   classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  REJECTED:  { label: 'Rejected',         classes: 'bg-red-500/10 text-red-400 border-red-500/30' },
  SUSPENDED: { label: 'Suspended',        classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

const orderStatusClasses: Record<string, string> = {
  PAID:       'bg-green-500/10 text-green-400 border-green-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PENDING:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CANCELLED:  'bg-red-500/10 text-red-400 border-red-500/20',
};

// ─── Document Preview Modal ───────────────────────
function DocModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  const isImage = /\.(jpg|jpeg|png)(\?|$)/i.test(url);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <p className="font-semibold text-white">{label}</p>
          <div className="flex items-center gap-2">
            <a href={`http://localhost:5000${url}`} download className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-gold text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              <Download className="w-3 h-3" /> Download
            </a>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {isImage ? (
            <img src={`http://localhost:5000${url}`} alt={label} className="max-w-full rounded-lg" />
          ) : (
            <iframe src={`http://localhost:5000${url}`} className="w-full h-[60vh] rounded-lg" title={label} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PICDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pic, setPic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<{ url: string; label: string } | null>(null);

  const fetchPIC = async () => {
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
  };

  useEffect(() => { if (id) fetchPIC(); }, [id]);

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
      {docModal && <DocModal url={docModal.url} label={docModal.label} onClose={() => setDocModal(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pics" className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{pic.fullName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">Partner In Charge — Detail View</p>
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

      {/* Profile + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl font-bold text-brand-gold border border-gray-600">
              {pic.fullName.charAt(0)}
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${status.classes}`}>{status.label}</span>
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

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <StatCard icon={<TrendingUp className="w-6 h-6 text-green-400" />} label="Total Earnings" value={formatCurrency(pic.wallet?.totalEarnings || 0)} bg="bg-green-500/5 border-green-500/20" />
          <StatCard icon={<Wallet className="w-6 h-6 text-brand-gold" />} label="Available Balance" value={formatCurrency(pic.wallet?.availableBalance || 0)} bg="bg-yellow-500/5 border-yellow-500/20" />
          <StatCard icon={<ShoppingCart className="w-6 h-6 text-blue-400" />} label="Total Orders" value={String(pic._count?.orders || 0)} bg="bg-blue-500/5 border-blue-500/20" />
          <StatCard icon={<Clock className="w-6 h-6 text-purple-400" />} label="Pending Earnings" value={formatCurrency(pic.wallet?.pendingEarnings || 0)} bg="bg-purple-500/5 border-purple-500/20" />
        </div>
      </div>

      {/* Application Timeline */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Application Timeline</h2>
        <div className="flex flex-wrap gap-6">
          <TimelineItem icon={<Calendar className="w-4 h-4" />} label="Registered" value={pic.createdAt} />
          <TimelineItem icon={<CheckCircle className="w-4 h-4 text-green-400" />} label="Approved" value={pic.approvedAt} empty="Not yet approved" />
          <TimelineItem icon={<User className="w-4 h-4 text-blue-400" />} label="Profile Completed" value={pic.profileCompletedAt} empty="Not completed" />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Status</p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border w-fit ${status.classes}`}>{status.label}</span>
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
          {/* Identity */}
          {(pic.aadhaarNumber || pic.panCard) && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-brand-gold" />
                <h2 className="text-base font-semibold text-white">Identity (KYC)</h2>
              </div>
              <div className="space-y-3">
                {pic.aadhaarNumber && <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Aadhaar" value={`XXXX XXXX ${pic.aadhaarNumber.slice(-4)}`} onCopy={() => copy(pic.aadhaarNumber, 'Aadhaar')} />}
                {pic.panCard && <InfoRow icon={<CreditCard className="w-4 h-4" />} label="PAN" value={pic.panCard} onCopy={() => copy(pic.panCard, 'PAN')} />}
              </div>
            </div>
          )}

          {/* Bank */}
          {pic.bankName && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-brand-gold" />
                <h2 className="text-base font-semibold text-white">Bank Details</h2>
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
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-semibold text-white">Uploaded Documents</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pic.aadhaarDocument && (
              <DocCard label="Aadhaar Document" url={pic.aadhaarDocument} onPreview={() => setDocModal({ url: pic.aadhaarDocument, label: 'Aadhaar Document' })} />
            )}
            {pic.panDocument && (
              <DocCard label="PAN Document" url={pic.panDocument} onPreview={() => setDocModal({ url: pic.panDocument, label: 'PAN Document' })} />
            )}
            {pic.resumeDocument && (
              <DocCard label="Resume" url={pic.resumeDocument} onPreview={() => setDocModal({ url: pic.resumeDocument, label: 'Resume' })} />
            )}
          </div>
        </div>
      )}

      {/* Professional Info */}
      {(pic.occupation || pic.whyJoin) && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-semibold text-white">Professional & PIC Details</h2>
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

      {/* Recent Orders */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <span className="text-xs text-gray-500">Last 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/30 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Commission</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {!pic.orders?.length ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet</td></tr>
              ) : pic.orders.map((o: any) => (
                <tr key={o.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-300">#{o.shopifyOrderId}</td>
                  <td className="px-6 py-4 text-white font-medium">{formatCurrency(o.orderAmount)}</td>
                  <td className="px-6 py-4 text-brand-gold font-medium">{formatCurrency(o.commissionAmount)}</td>
                  <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${orderStatusClasses[o.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{o.status}</span></td>
                  <td className="px-6 py-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Payouts</h2>
          <span className="text-xs text-gray-500">Last 5</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/30 border-b border-gray-700">
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
                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-gray-300">{p.paymentMethod || 'UPI'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${p.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' : p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(p.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-gray-400">{p.processedAt ? new Date(p.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ───────────────────────────────

function DocCard({ label, url, onPreview }: { label: string; url: string; onPreview: () => void }) {
  const isImage = /\.(jpg|jpeg|png)(\?|$)/i.test(url);
  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-400">{isImage ? 'Image' : 'Document'}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
          <Eye className="w-3 h-3" /> Preview
        </button>
        <a href={`http://localhost:5000${url}`} download className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-lg transition-colors">
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
      <div className="text-gray-500 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm text-gray-200 break-all ${valueClass || ''}`}>{value}</p>
          {badge && <span className={`text-[10px] font-medium ${badgeClass}`}>{badge}</span>}
          {onCopy && (
            <button onClick={onCopy} className="text-gray-600 hover:text-brand-gold transition-colors">
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
    <div className={`bg-gray-800 border rounded-2xl p-5 flex items-start gap-4 ${bg}`}>
      <div className="p-2 rounded-xl bg-gray-700/50">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
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
          <p className="text-sm text-white">{new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">{empty || '—'}</p>
        )}
      </div>
    </div>
  );
}
