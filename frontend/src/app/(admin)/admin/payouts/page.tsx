"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Wallet, CheckCircle, Clock } from 'lucide-react';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/payouts?${params.toString()}`);
      setPayouts(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      toast.error('Failed to fetch payouts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, statusFilter]);

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
          <h1 className="text-3xl font-bold text-white mb-1">Payouts</h1>
          <p className="text-gray-400">Manage PIC withdrawal requests.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-white">Date Requested</th>
                <th className="px-6 py-4 font-medium text-white">PIC Partner</th>
                <th className="px-6 py-4 font-medium text-white">Amount</th>
                <th className="px-6 py-4 font-medium text-white">Payment Method</th>
                <th className="px-6 py-4 font-medium text-white">Status</th>
                <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
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
                  <tr key={payout.id} className="border-b border-gray-700 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{payout.pic?.fullName}</p>
                      <p className="text-xs text-gray-500">{payout.pic?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-lg">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{payout.paymentMethod}</p>
                      {payout.paymentMethod === 'UPI' && (
                        <p className="text-xs text-brand-gold">{payout.pic?.upiId}</p>
                      )}
                      {payout.paymentMethod === 'BANK_TRANSFER' && (
                        <div className="text-xs text-brand-gold mt-1">
                          A/C: {payout.pic?.bankAccountNumber} <br/>
                          IFSC: {payout.pic?.ifscCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center w-max ${
                        payout.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {payout.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {payout.status}
                      </span>
                      {payout.transactionRef && (
                        <p className="text-[10px] text-gray-500 mt-1">Ref: {payout.transactionRef}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'PENDING' && (
                        <button 
                          onClick={() => handleMarkPaid(payout.id)}
                          className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors font-medium text-xs border border-green-500/30"
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
