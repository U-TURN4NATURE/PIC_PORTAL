"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Building2, CheckCircle, XCircle, Loader2, User, Phone, Mail,
  ChevronDown, ChevronUp, RefreshCw, BadgeCheck
} from 'lucide-react';

interface BankApproval {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  // Current (active) bank details
  bankAccountName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  branchName: string | null;
  upiId: string | null;
  // Pending (requested) bank details
  pendingBankDetails: {
    bankAccountName?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
  };
  createdAt: string;
}

export default function BankApprovalsPage() {
  const [approvals, setApprovals] = useState<BankApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/bank-approvals');
      setApprovals(res.data.data || []);
    } catch {
      toast.error('Failed to load bank approval requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (picId: string) => {
    setProcessingId(picId);
    try {
      await api.post(`/admin/bank-approvals/${picId}/approve`);
      toast.success('Bank details approved successfully!');
      setApprovals(prev => prev.filter(a => a.id !== picId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (picId: string) => {
    setProcessingId(picId);
    try {
      await api.post(`/admin/bank-approvals/${picId}/reject`);
      toast.success('Bank details request rejected.');
      setApprovals(prev => prev.filter(a => a.id !== picId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const FieldRow = ({ label, current, requested }: { label: string; current?: string | null; requested?: string }) => {
    const changed = requested && requested !== current;
    return (
      <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-50 last:border-0 items-center">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className={`text-sm ${changed ? 'text-red-500 line-through' : 'text-gray-700'}`}>
          {current || <span className="text-gray-300 italic">—</span>}
        </p>
        <p className={`text-sm font-semibold ${changed ? 'text-green-600' : 'text-gray-400 italic'}`}>
          {requested || '—'}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-forest" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Bank Approvals</h1>
          <p className="text-gray-500">Review and approve bank detail update requests from PICs.</p>
        </div>
        <button
          onClick={fetchApprovals}
          className="flex items-center gap-2 px-4 py-2 border border-brand-sage/40 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm p-16 text-center">
          <BadgeCheck className="w-14 h-14 text-green-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 text-lg">All Clear!</p>
          <p className="text-gray-400 mt-1">No pending bank detail approvals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map(approval => {
            const p = approval.pendingBankDetails;
            const isExpanded = expandedId === approval.id;
            const isProcessing = processingId === approval.id;

            return (
              <div key={approval.id} className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-forest/10 flex items-center justify-center shrink-0">
                      <span className="text-brand-forest font-bold text-sm">
                        {approval.fullName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{approval.fullName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail className="w-3 h-3" /> {approval.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone className="w-3 h-3" /> {approval.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-medium">
                      Update Requested
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-brand-sage/20">
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3 mb-3 pb-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Field</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Current (Active)</p>
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Requested (New)</p>
                      </div>
                      <FieldRow label="UPI ID" current={approval.upiId} requested={p.upiId} />
                      <FieldRow label="Account Name" current={approval.bankAccountName} requested={p.bankAccountName} />
                      <FieldRow label="Bank Name" current={approval.bankName} requested={p.bankName} />
                      <FieldRow label="Account Number" current={approval.bankAccountNumber} requested={p.bankAccountNumber} />
                      <FieldRow label="IFSC Code" current={approval.ifscCode} requested={p.ifscCode} />
                      <FieldRow label="Branch Name" current={approval.branchName} requested={p.branchName} />
                    </div>

                    {/* Action Buttons */}
                    <div className="px-5 pb-5 flex gap-3">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 text-sm"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60 text-sm"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
