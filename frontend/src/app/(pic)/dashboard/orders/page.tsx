"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';

export default function PICOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    api.get(`/pic/orders?page=${page}&limit=10`)
      .then(res => {
        setOrders(res.data.data || []);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, [page]);

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">My Orders</h1>
          <p className="text-gray-500">Orders placed through your referral link.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-forest/10 text-brand-forest px-4 py-2 rounded-xl text-sm font-medium">
          <ShoppingCart className="w-4 h-4" />
          {meta?.total ?? 0} Total Orders
        </div>
      </div>

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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No orders yet</p>
                    <p className="text-gray-400 text-xs mt-1">Share your referral link to start earning!</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-sage/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">#{order.shopifyOrderNum || order.shopifyOrderId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{order.customerName || '—'}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail || ''}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(order.orderAmount)}</td>
                    <td className="px-6 py-4 font-bold text-brand-forest">+{formatCurrency(order.commissionAmount)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors.PENDING}`}>
                        {order.status}
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
