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
        toast.success(`Commission credited to ${referral.pic?.fullName}'s wallet!`);
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
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
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
        <h1 className="text-2xl font-dm-serif text-brand-forest">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">All people referred by PICs. Update their status and log sales here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Referred', value: String(filtered.length), sub: 'across all PICs' },
          { label: 'Buying / Active', value: String(buyingCount), sub: 'successful referrals' },
          { label: 'Total Sales', value: formatCurrency(totalSales), sub: 'logged by admin' },
          { label: 'Total Commission', value: formatCurrency(totalCommission), sub: 'credited to PICs' },
        ].map(s => (
          <div key={s.label} className="bg-white shadow-sm border border-brand-sage/20 rounded-2xl p-4">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-brand-forest/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border border-brand-sage/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or PIC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
          />
        </div>

        {/* PIC Dropdown */}
        <div className="relative">
          <select
            value={selectedPic}
            onChange={e => setSelectedPic(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 cursor-pointer min-w-[180px]"
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
            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 cursor-pointer min-w-[160px]"
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
      <div className="bg-white shadow-sm border border-brand-sage/20 rounded-2xl overflow-hidden">
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
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold">Referred By (PIC)</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Sales</th>
                  <th className="px-6 py-3 text-right font-semibold">Commission</th>
                  <th className="px-6 py-3 text-center font-semibold">Follow-ups</th>
                  <th className="px-6 py-3 text-center font-semibold">Add Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((ref: any) => {
                  const sc = STATUS_CONFIG[ref.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={ref.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{ref.personName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{new Date(ref.createdAt).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-xs"><Phone className="w-3 h-3 text-gray-400" />{ref.personPhone}</div>
                        {ref.personEmail && <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5"><Mail className="w-3 h-3 text-gray-400" />{ref.personEmail}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 text-sm font-semibold">{ref.pic?.fullName}</p>
                        <p className="text-brand-forest text-xs font-medium">{ref.pic?.referralCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ref.status}
                          disabled={statusUpdating === ref.id}
                          onChange={e => handleUpdateStatus(ref.id, e.target.value)}
                          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none ${sc.color}`}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-white text-gray-900">{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-semibold">₹{ref.totalSalesAmount.toFixed(0)}</td>
                      <td className="px-6 py-4 text-right text-brand-gold font-bold">₹{ref.commissionAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        {ref.followUpRequests?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-full font-medium">
                            <Flag className="w-3 h-3" /> {ref.followUpRequests.length}
                          </span>
                        ) : <span className="text-gray-400 text-xs">—</span>}
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

      {/* What counts as a successful referral note */}
      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-4">
        <p className="text-brand-forest text-sm font-bold mb-1">💡 What counts as a Successful Referral?</p>
        <p className="text-gray-700 text-xs leading-relaxed">
          Since referrals are entered manually by PICs, a referral is considered <strong className="text-gray-900">successful</strong> when the Admin updates its status to <strong className="text-green-700">Buying</strong> or <strong className="text-purple-700">Active Seller</strong>.
          This means the referred person has made a purchase and the PIC deserves their commission — which you can credit using the <strong className="text-brand-gold">"Add Sale"</strong> button.
        </p>
      </div>
    </div>
  );
}
