"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Wallet, ArrowDownCircle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', paymentMethod: 'UPI', notes: '' });

  const fetchData = async () => {
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        api.get('/pic/wallet'),
        api.get('/pic/payouts'),
      ]);
      setWallet(walletRes.data.data);
      setPayouts(payoutsRes.data.data || []);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (Number(form.amount) > (wallet?.availableBalance || 0)) {
      toast.error('Amount exceeds available balance');
      return;
    }
    try {
      setIsRequesting(true);
      await api.post('/pic/payouts', { amount: Number(form.amount), paymentMethod: form.paymentMethod, notes: form.notes });
      toast.success('Payout request submitted!');
      setShowForm(false);
      setForm({ amount: '', paymentMethod: 'UPI', notes: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payout request');
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-48 bg-white rounded-2xl border border-brand-sage/20" />
      <div className="h-64 bg-white rounded-2xl border border-brand-sage/20" />
    </div>;
  }

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    PROCESSING: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    PAID: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    FAILED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">My Wallet</h1>
        <p className="text-gray-500">Manage your earnings and withdrawal requests.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available', value: wallet?.availableBalance, color: 'text-brand-forest', bg: 'bg-brand-forest/10' },
          { label: 'Total Earned', value: wallet?.totalEarnings, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
          { label: 'Pending', value: wallet?.pendingEarnings, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Paid Out', value: wallet?.paidEarnings, color: 'text-gray-600', bg: 'bg-gray-100' },
        ].map(item => (
          <div key={item.label} className="bg-white border border-brand-sage/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3`}>
              <Wallet className={`w-5 h-5 ${item.color}`} />
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{formatCurrency(item.value || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Withdrawal Request */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-sage/20 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Request Withdrawal</h3>
            <p className="text-sm text-gray-400 mt-0.5">Minimum withdrawal: ₹500</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={(wallet?.availableBalance || 0) < 500}
              className="flex items-center gap-2 bg-brand-forest text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowDownCircle className="w-4 h-4" /> Withdraw
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder={`Max: ₹${(wallet?.availableBalance || 0).toFixed(0)}`}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 text-gray-900 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 text-gray-900 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes for the admin..."
                className="w-full px-4 py-3 rounded-xl border border-brand-sage/50 text-gray-900 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleRequest} disabled={isRequesting} className="flex-1 bg-brand-forest text-white font-semibold py-3 rounded-xl hover:bg-brand-forest/90 transition-colors disabled:opacity-60 flex items-center justify-center">
                {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-brand-sage/50 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-sage/20">
          <h3 className="font-semibold text-gray-900">Payout History</h3>
        </div>
        {payouts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p>No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-sage/10">
            {payouts.map((p: any) => {
              const cfg = statusConfig[p.status] || statusConfig.PENDING;
              const Icon = cfg.icon;
              return (
                <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cfg.bg} border`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-gray-400">{p.paymentMethod} • {new Date(p.requestedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>{p.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
