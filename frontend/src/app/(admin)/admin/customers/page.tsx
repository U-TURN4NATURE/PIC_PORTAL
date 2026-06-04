"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Users, Phone, Mail, ChevronDown, IndianRupee,
  RefreshCw, X, Flag, Search, Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ─────────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:       { label: 'Pending',        color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  CONTACTED:     { label: 'Contacted',      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  INTERESTED:    { label: 'Interested',     color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  BUYING:        { label: 'Buying ✅',      color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  NOT_BUYING:    { label: 'Not Buying',     color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ACTIVE_SELLER: { label: 'Active Seller ⭐', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  INACTIVE:      { label: 'Inactive',       color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

// ─────────────────────────────────────────────────
// Add Sale Modal
// ─────────────────────────────────────────────────
function SaleModal({ referral, onClose, onSuccess }: { referral: any; onClose: () => void; onSuccess: () => void }) {
  const [salesAmount, setSalesAmount] = useState('');
  const [commissionRate, setCommissionRate] = useState(String(referral.commissionRate || 5));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!salesAmount) { toast.error('Enter a sale amount'); return; }
    setLoading(true);
    try {
      const res = await api.patch(`/admin/referrals/${referral.id}/sales`, {
        salesAmount: parseFloat(salesAmount),
        commissionRate: parseFloat(commissionRate),
      });
      toast.success(`₹${res.data.data.commissionEarned.toFixed(2)} commission credited to ${referral.pic?.fullName}'s wallet!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add sale');
    } finally { setLoading(false); }
  };

  const commission = salesAmount ? ((parseFloat(salesAmount) * parseFloat(commissionRate)) / 100).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Add Sale Entry</h3>
            <p className="text-xs text-gray-400 mt-0.5">For: <span className="text-white">{referral.personName}</span></p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sale Amount (₹) *</label>
            <input
              type="number" min="1"
              value={salesAmount}
              onChange={e => setSalesAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Commission Rate (%)</label>
            <input
              type="number" min="0" max="100"
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
          {salesAmount && (
            <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3 text-sm">
              <span className="text-gray-400">Commission to credit: </span>
              <span className="text-brand-gold font-bold">₹{commission}</span>
              <span className="text-gray-500 ml-2">→ {referral.pic?.fullName}'s wallet</span>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-600 rounded-xl text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-brand-gold text-gray-900 rounded-xl text-sm font-semibold hover:bg-yellow-400 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              Credit Commission
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
export default function CustomersPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [pics, setPics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPic, setSelectedPic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [saleModal, setSaleModal] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [refRes, picRes] = await Promise.all([
        api.get('/admin/referrals?limit=500'),
        api.get('/admin/pics?limit=200'),
      ]);
      setReferrals(refRes.data.referrals || []);
      setPics(picRes.data.data?.pics || []);
    } catch {
      toast.error('Failed to load customers');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (referralId: string, status: string) => {
    setStatusUpdating(referralId);
    try {
      await api.patch(`/admin/referrals/${referralId}/status`, { status });
      toast.success('Status updated!');
      setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status } : r));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally { setStatusUpdating(null); }
  };

  // Filter
  const filtered = referrals.filter(r => {
    const picMatch = selectedPic === 'all' || r.picId === selectedPic;
    const statusMatch = selectedStatus === 'all' || r.status === selectedStatus;
    const searchMatch = !search ||
      r.personName.toLowerCase().includes(search.toLowerCase()) ||
      r.personPhone.includes(search) ||
      r.pic?.fullName?.toLowerCase().includes(search.toLowerCase());
    return picMatch && statusMatch && searchMatch;
  });

  // Stats
  const totalSales = filtered.reduce((s, r) => s + r.totalSalesAmount, 0);
  const totalCommission = filtered.reduce((s, r) => s + r.commissionAmount, 0);
  const buyingCount = filtered.filter(r => r.status === 'BUYING' || r.status === 'ACTIVE_SELLER').length;

  return (
    <div className="space-y-6">
      {/* Sale Modal */}
      {saleModal && (
        <SaleModal
          referral={saleModal}
          onClose={() => setSaleModal(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">All people referred by PICs. Update their status and log sales here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Referred', value: String(filtered.length), sub: 'across all PICs' },
          { label: 'Buying / Active', value: String(buyingCount), sub: 'successful referrals' },
          { label: 'Total Sales', value: formatCurrency(totalSales), sub: 'logged by admin' },
          { label: 'Total Commission', value: formatCurrency(totalCommission), sub: 'credited to PICs' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, phone or PIC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
        </div>

        {/* PIC Dropdown */}
        <div className="relative">
          <select
            value={selectedPic}
            onChange={e => setSelectedPic(e.target.value)}
            className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 pr-9 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 cursor-pointer min-w-[180px]"
          >
            <option value="all">All PICs</option>
            {pics.map(p => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.referralCode})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 pr-9 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 cursor-pointer min-w-[160px]"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No customers found.</p>
            <p className="text-gray-600 text-sm mt-1">PICs refer customers by entering their name and phone number.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/30 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Referred By (PIC)</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Sales</th>
                  <th className="px-6 py-3 text-right">Commission</th>
                  <th className="px-6 py-3 text-center">Follow-ups</th>
                  <th className="px-6 py-3 text-center">Add Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filtered.map((ref: any) => {
                  const sc = STATUS_CONFIG[ref.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={ref.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{ref.personName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{new Date(ref.createdAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-300 text-xs"><Phone className="w-3 h-3" />{ref.personPhone}</div>
                        {ref.personEmail && <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5"><Mail className="w-3 h-3" />{ref.personEmail}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{ref.pic?.fullName}</p>
                        <p className="text-gray-500 text-xs">{ref.pic?.referralCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ref.status}
                          disabled={statusUpdating === ref.id}
                          onChange={e => handleUpdateStatus(ref.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none ${sc.color}`}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-gray-800 text-white">{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300 font-medium">₹{ref.totalSalesAmount.toFixed(0)}</td>
                      <td className="px-6 py-4 text-right text-brand-gold font-semibold">₹{ref.commissionAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        {ref.followUpRequests?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">
                            <Flag className="w-3 h-3" /> {ref.followUpRequests.length}
                          </span>
                        ) : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSaleModal(ref)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 rounded-lg text-xs font-medium transition-colors"
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

      {/* What counts as a successful referral note */}
      <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-4">
        <p className="text-brand-gold text-sm font-semibold mb-1">💡 What counts as a Successful Referral?</p>
        <p className="text-gray-400 text-xs leading-relaxed">
          Since referrals are entered manually by PICs, a referral is considered <strong className="text-white">successful</strong> when the Admin updates its status to <strong className="text-green-400">Buying</strong> or <strong className="text-purple-400">Active Seller</strong>.
          This means the referred person has made a purchase and the PIC deserves their commission — which you can credit using the <strong className="text-brand-gold">"Add Sale"</strong> button.
        </p>
      </div>
    </div>
  );
}
