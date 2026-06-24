"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Wallet, CheckCircle, Clock } from 'lucide-react';

import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export default function AdminPayoutsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const params = new URLSearchParams({ page: page.toString(), limit: '10' });
  if (statusFilter) params.append('status', statusFilter);

  const { data, isLoading, mutate: fetchPayouts } = useSWR(`/admin/payouts?${params.toString()}`, fetcher, {
    keepPreviousData: true,
  });

  const payouts: any[] = data?.data || [];
  const meta = data?.meta || null;

  const handleMarkPaid = async (id: string) => {
    const transactionRef = window.prompt('Enter transaction reference/ID (optional):');
    if (transactionRef === null) return; // cancelled

    try {
      await api.patch(`/admin/payouts/${id}/mark-paid`, { transactionRef });
      toast.success('Payout marked as paid');
      fetchPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-dm-serif text-brand-forest mb-1">Payouts</h1>
          <p className="text-gray-500 text-sm">Manage PIC withdrawal requests.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="bg-white shadow-sm border border-brand-sage/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date Requested</th>
                <th className="px-6 py-4 font-semibold">PIC Partner</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payouts found.</td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{payout.pic?.fullName}</p>
                      <p className="text-xs text-gray-500">{payout.pic?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{payout.paymentMethod}</p>
                      {payout.paymentMethod === 'UPI' && (
                        <p className="text-xs text-brand-forest mt-0.5">{payout.pic?.upiId}</p>
                      )}
                      {payout.paymentMethod === 'BANK_TRANSFER' && (
                        <div className="text-xs text-gray-500 mt-1">
                          A/C: {payout.pic?.bankAccountNumber} <br/>
                          IFSC: {payout.pic?.ifscCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center w-max ${
                        payout.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {payout.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {payout.status}
                      </span>
                      {payout.transactionRef && (
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">Ref: {payout.transactionRef}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'PENDING' && (
                        <button 
                          onClick={() => handleMarkPaid(payout.id)}
                          className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium text-xs border border-green-200 shadow-sm"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
