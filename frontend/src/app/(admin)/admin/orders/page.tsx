"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/orders?page=${page}&limit=10`);
      setOrders(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Orders</h1>
        <p className="text-gray-400">View all orders and associated referral commissions.</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-white">Order ID</th>
                <th className="px-6 py-4 font-medium text-white">Customer</th>
                <th className="px-6 py-4 font-medium text-white">Amount</th>
                <th className="px-6 py-4 font-medium text-white">PIC / Referral Code</th>
                <th className="px-6 py-4 font-medium text-white">Commission</th>
                <th className="px-6 py-4 font-medium text-white">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">#{order.shopifyOrderNum}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(order.orderAmount)}</td>
                    <td className="px-6 py-4">
                      {order.pic ? (
                        <>
                          <p className="text-brand-gold">{order.pic.fullName}</p>
                          <p className="text-xs text-gray-500">{order.referralCode}</p>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">Direct (No referral)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-green-400 font-medium">
                      {order.commissionAmount > 0 ? formatCurrency(order.commissionAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-400">Showing page {meta.page} of {meta.totalPages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrev} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={!meta.hasNext} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
