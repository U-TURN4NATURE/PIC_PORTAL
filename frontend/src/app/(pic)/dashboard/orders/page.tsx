"use client";

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ShoppingCart, Search, X, Download, Calendar } from 'lucide-react';

export default function PICOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    setIsLoading(true);
    api.get(`/pic/orders?page=${page}&limit=50`)
      .then(res => {
        setOrders(res.data.data || []);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, [page]);

  // Client-side filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const name = (order.referral?.personName || '').toLowerCase();
      const matchesName = !searchName || name.includes(searchName.toLowerCase());

      const orderDate = new Date(order.saleDate || order.createdAt);
      const matchesFrom = !fromDate || orderDate >= new Date(fromDate);
      const matchesTo = !toDate || orderDate <= new Date(toDate + 'T23:59:59');

      return matchesName && matchesFrom && matchesTo;
    });
  }, [orders, searchName, fromDate, toDate]);

  const clearFilters = () => {
    setSearchName('');
    setFromDate('');
    setToDate('');
  };

  const hasFilters = searchName || fromDate || toDate;

  // Export CSV
  const handleExport = () => {
    if (filteredOrders.length === 0) { toast.error('Koi order nahi hai export karne ke liye'); return; }
    const headers = ['Order ID', 'Customer Name', 'Order Amount (₹)', 'Commission (₹)', 'Commission Rate (%)', 'Date', 'Status'];
    const rows = filteredOrders.map(o => [
      o.id.slice(-8).toUpperCase(),
      o.referral?.personName || 'Referred',
      o.saleAmount,
      o.commissionEarned,
      o.commissionRate,
      new Date(o.saleDate || o.createdAt).toLocaleDateString('en-IN'),
      'COMPLETED',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filteredOrders.length} orders exported!`);
  };

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">My Orders</h1>
          <p className="text-gray-500">Orders placed through your referral link.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-forest text-white rounded-xl text-sm font-semibold hover:bg-brand-olive transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <div className="flex items-center gap-2 bg-brand-forest/10 text-brand-forest px-4 py-2 rounded-xl text-sm font-medium">
            <ShoppingCart className="w-4 h-4" />
            {meta?.total ?? 0} Total Orders
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Name Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
            />
            {searchName && (
              <button onClick={() => setSearchName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* From Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-forest/30 bg-white"
            />
          </div>

          <span className="text-gray-400 text-sm font-medium">to</span>

          {/* To Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-forest/30 bg-white"
            />
          </div>

          {/* Clear + Count */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-sage/10 text-gray-600 border-b border-brand-sage/20">
              <tr>
                <th className="px-6 py-4 font-medium">Order #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Order Amount</th>
                <th className="px-6 py-4 font-medium">Contribution (5%)</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/10">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {hasFilters ? 'No orders match your filters' : 'No orders yet'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {hasFilters ? 'Try clearing filters to see all orders.' : 'Share your referral link to start earning!'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-sage/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 truncate max-w-[120px]">
                      <span title={order.id}>{order.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{order.referral?.personName || '—'}</p>
                      <p className="text-xs text-gray-400">{order.referral?.personEmail || ''}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.saleAmount)}</td>
                    <td className="px-6 py-4 font-bold text-brand-forest">
                      +{formatCurrency(order.commissionEarned)} <span className="text-xs text-brand-sage font-normal ml-1">({order.commissionRate}%)</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.saleDate || order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors.PAID}`}>
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-brand-sage/20 flex items-center justify-between">
            <span className="text-sm text-gray-400">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrev} className="px-4 py-1.5 bg-brand-forest/10 text-brand-forest rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-forest/20 transition-colors">← Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={!meta.hasNext} className="px-4 py-1.5 bg-brand-forest/10 text-brand-forest rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-forest/20 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
