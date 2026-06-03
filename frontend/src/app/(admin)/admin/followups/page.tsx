"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Flag, RefreshCw, CheckCircle2, Clock, XCircle, ChevronDown, Phone, Mail, User, MessageSquare, X
} from 'lucide-react';

type FollowUpStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'DISMISSED';
type Priority = 'LOW' | 'NORMAL' | 'HIGH';

interface FollowUp {
  id: string;
  reason: string;
  priority: Priority;
  status: FollowUpStatus;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  pic: { id: string; fullName: string; email: string; phone: string };
  referral: { personName: string; personPhone: string; personEmail?: string; status: string };
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  HIGH:   { label: 'High',   color: 'bg-red-500/10 text-red-400 border-red-500/20',       icon: '🔴' },
  NORMAL: { label: 'Normal', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '🟡' },
  LOW:    { label: 'Low',    color: 'bg-green-500/10 text-green-400 border-green-500/20',  icon: '🟢' },
};

const STATUS_CONFIG: Record<FollowUpStatus, { label: string; color: string }> = {
  OPEN:        { label: 'Open',        color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  DONE:        { label: 'Done',        color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  DISMISSED:   { label: 'Dismissed',  color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

// ─────────────────────────────────────────────────
// Notes Modal
// ─────────────────────────────────────────────────
function NotesModal({
  followUp,
  targetStatus,
  onClose,
  onSuccess,
}: {
  followUp: FollowUp;
  targetStatus: FollowUpStatus;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState(followUp.adminNotes || '');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/admin/followups/${followUp.id}`, { status: targetStatus, adminNotes: notes });
      toast.success(`Request marked as ${targetStatus.replace('_', ' ').toLowerCase()}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const actionLabel =
    targetStatus === 'IN_PROGRESS' ? 'Mark In Progress' :
    targetStatus === 'DONE' ? 'Mark as Done' : 'Dismiss';

  const btnColor =
    targetStatus === 'DONE' ? 'bg-green-600 hover:bg-green-500' :
    targetStatus === 'IN_PROGRESS' ? 'bg-blue-600 hover:bg-blue-500' :
    'bg-gray-600 hover:bg-gray-500';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{actionLabel}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-4 mb-4 text-sm">
          <p className="text-gray-400">Referred Person: <span className="text-white font-medium">{followUp.referral.personName}</span></p>
          <p className="text-gray-400 mt-1">Requested by PIC: <span className="text-white font-medium">{followUp.pic.fullName}</span></p>
          <p className="text-gray-400 mt-1 italic">"{followUp.reason}"</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Add Admin Notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Called the person, they will buy next week..."
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-600 rounded-xl text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
          <button onClick={submit} disabled={loading} className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 ${btnColor}`}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────
export default function FollowUpRequestsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{ followUp: FollowUp; targetStatus: FollowUpStatus } | null>(null);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const res = await api.get(`/admin/followups?${params.toString()}`);
      setFollowUps(res.data.requests);
      setOpenCount(res.data.openCount);
    } catch { toast.error('Failed to load follow-up requests'); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  return (
    <div className="space-y-6">
      {/* Notes/Action Modal */}
      {actionModal && (
        <NotesModal
          followUp={actionModal.followUp}
          targetStatus={actionModal.targetStatus}
          onClose={() => setActionModal(null)}
          onSuccess={fetchFollowUps}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Follow-up Requests</h1>
            {openCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold">
                {openCount} Open
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">PICs have requested admin follow-up for these referred people.</p>
        </div>
        <button onClick={fetchFollowUps} className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">
          {[
            { value: '', label: 'All' },
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'DONE', label: 'Done' },
            { value: 'DISMISSED', label: 'Dismissed' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === opt.value ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">
          {[
            { value: '', label: 'All Priorities' },
            { value: 'HIGH', label: '🔴 High' },
            { value: 'NORMAL', label: '🟡 Normal' },
            { value: 'LOW', label: '🟢 Low' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPriorityFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                priorityFilter === opt.value ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading follow-up requests...</p>
          </div>
        ) : followUps.length === 0 ? (
          <div className="p-12 text-center">
            <Flag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No follow-up requests found</p>
            <p className="text-gray-500 text-sm mt-1">
              {statusFilter === 'OPEN' ? 'All open requests have been actioned.' : 'No requests match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/30 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">PIC</th>
                  <th className="px-6 py-3 text-left">Referred Person</th>
                  <th className="px-6 py-3 text-center">Priority</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-left">Admin Notes</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {followUps.map((fu) => {
                  const pc = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.NORMAL;
                  const sc = STATUS_CONFIG[fu.status] || STATUS_CONFIG.OPEN;
                  return (
                    <tr key={fu.id} className="hover:bg-gray-700/20 transition-colors">
                      {/* PIC */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{fu.pic.fullName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{fu.pic.phone}</p>
                      </td>
                      {/* Referred Person */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-200">{fu.referral.personName}</p>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                          <Phone className="w-3 h-3" />{fu.referral.personPhone}
                        </div>
                      </td>
                      {/* Priority */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${pc.color}`}>
                          {pc.icon} {pc.label}
                        </span>
                      </td>
                      {/* Reason */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{fu.reason}</p>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                          {fu.status.replace('_', ' ')}
                        </span>
                      </td>
                      {/* Admin Notes */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-500 text-xs italic line-clamp-2">{fu.adminNotes || '—'}</p>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(fu.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          {fu.status === 'OPEN' && (
                            <button
                              onClick={() => setActionModal({ followUp: fu, targetStatus: 'IN_PROGRESS' })}
                              className="px-2.5 py-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                              In Progress
                            </button>
                          )}
                          {(fu.status === 'OPEN' || fu.status === 'IN_PROGRESS') && (
                            <>
                              <button
                                onClick={() => setActionModal({ followUp: fu, targetStatus: 'DONE' })}
                                className="px-2.5 py-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg font-medium transition-colors"
                              >
                                Done
                              </button>
                              <button
                                onClick={() => setActionModal({ followUp: fu, targetStatus: 'DISMISSED' })}
                                className="px-2.5 py-1.5 text-xs bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20 rounded-lg font-medium transition-colors"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          {(fu.status === 'DONE' || fu.status === 'DISMISSED') && (
                            <span className="text-gray-600 text-xs">Resolved</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
