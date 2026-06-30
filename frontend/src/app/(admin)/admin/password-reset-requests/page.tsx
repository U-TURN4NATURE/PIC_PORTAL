"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  KeyRound, Clock, CheckCircle2, XCircle, RefreshCw, User, Mail,
  Phone, MessageSquare, ShieldCheck, ShieldAlert, Filter, Search,
  ChevronDown,
} from 'lucide-react';

// ─── Status Config ───────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: 'Pending Review',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: Clock },
  APPROVED:  { label: 'Approved',        color: 'bg-green-50 text-green-700 border-green-200',     icon: CheckCircle2 },
  REJECTED:  { label: 'Rejected',        color: 'bg-red-50 text-red-700 border-red-200',           icon: XCircle },
  COMPLETED: { label: 'Completed',       color: 'bg-blue-50 text-blue-700 border-blue-200',        icon: ShieldCheck },
};

// ─── Approve/Reject Modal ─────────────────────────
function ActionModal({
  request,
  action,
  onClose,
  onSuccess,
}: {
  request: any;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  const isApprove = action === 'approve';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = isApprove
        ? `/admin/password-reset-requests/${request.id}/approve`
        : `/admin/password-reset-requests/${request.id}/reject`;

      await api.post(endpoint, { adminNote: adminNote || undefined });

      toast.success(
        isApprove
          ? `Reset link sent to ${request.pic?.email}`
          : 'Request rejected successfully'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isApprove ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {isApprove ? <ShieldCheck className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {isApprove ? 'Approve Reset Request' : 'Reject Reset Request'}
              </h3>
              <p className="text-white/80 text-sm">{request.pic?.fullName}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* PIC Info Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{request.pic?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{request.pic?.phone}</span>
            </div>
            {request.requestNote && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">PIC's Reason:</p>
                <p className="text-sm text-gray-700 italic leading-relaxed">"{request.requestNote}"</p>
              </div>
            )}
          </div>

          {/* Action Info */}
          {isApprove && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
              ✅ Approving will send a <strong>password reset link</strong> to {request.pic?.email} and a <strong>WhatsApp OTP</strong> to {request.pic?.phone}. The link expires in 1 hour.
            </div>
          )}
          {!isApprove && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
              ❌ Rejecting this request means the PIC will need to submit a new request if they still need help.
            </div>
          )}

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note for PIC <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              rows={3}
              placeholder={isApprove ? 'E.g. Approved. Reset link sent to your email.' : 'E.g. Could not verify identity. Please contact support.'}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-forest/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25'
                  : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isApprove ? (
                <><ShieldCheck className="w-4 h-4" /> Approve & Send Link</>
              ) : (
                <><XCircle className="w-4 h-4" /> Reject Request</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────
export default function PasswordResetRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState<{ request: any; action: 'approve' | 'reject' } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/password-reset-requests');
      setRequests(res.data.data?.requests || []);
      setPendingCount(res.data.data?.pendingCount || 0);
    } catch {
      toast.error('Failed to load password reset requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Filter
  const filtered = requests.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const searchMatch = !search ||
      r.pic?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.pic?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.pic?.phone?.includes(search);
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Action Modal */}
      {actionModal && (
        <ActionModal
          request={actionModal.request}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onSuccess={fetchRequests}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-dm-serif text-brand-forest flex items-center gap-2">
            <KeyRound className="w-6 h-6" />
            Password Reset Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve/reject password reset requests from PIC partners.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-sage/30 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: String(requests.filter(r => r.status === 'PENDING').length), color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: String(requests.filter(r => r.status === 'APPROVED').length), color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: String(requests.filter(r => r.status === 'REJECTED').length), color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Requests', value: String(requests.length), color: 'text-brand-forest', bg: 'bg-brand-sage/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/50`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 cursor-pointer min-w-[160px]"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-yellow-700" />
          </div>
          <div>
            <p className="text-yellow-800 font-semibold text-sm">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting your review
            </p>
            <p className="text-yellow-700 text-xs mt-0.5">
              Review and approve/reject each request. Approved requests send a reset link to the PIC's email + WhatsApp OTP.
            </p>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p>Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <KeyRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No password reset requests found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus !== 'all' ? 'Try changing the filter.' : 'PIC partners will appear here when they submit a reset request.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(request => {
              const sc = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = sc.icon;
              const isPending = request.status === 'PENDING';

              return (
                <div key={request.id} className={`p-5 hover:bg-gray-50/50 transition-colors ${isPending ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
                    {/* Left: PIC Info */}
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-brand-forest" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{request.pic?.fullName}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />{request.pic?.email}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />{request.pic?.phone}
                          </span>
                        </div>

                        {/* Request Note */}
                        {request.requestNote && (
                          <div className="mt-2 bg-gray-50 rounded-lg p-2.5 flex gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 italic leading-relaxed">"{request.requestNote}"</p>
                          </div>
                        )}

                        {/* Admin Note */}
                        {request.adminNote && (
                          <div className="mt-2 bg-blue-50 rounded-lg p-2.5 flex gap-2 border border-blue-100">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                              <span className="font-semibold">Admin note:</span> {request.adminNote}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {new Date(request.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {isPending && (
                      <div className="flex gap-2 shrink-0 sm:flex-col">
                        <button
                          id={`approve-request-${request.id}`}
                          onClick={() => setActionModal({ request, action: 'approve' })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          id={`reject-request-${request.id}`}
                          onClick={() => setActionModal({ request, action: 'reject' })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-xl transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
