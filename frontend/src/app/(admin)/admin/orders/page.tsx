"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, mutate: fetchOrders } = useSWR(`/admin/orders?page=${page}&limit=10`, fetcher, {
    keepPreviousData: true,
  });

  const orders: any[] = data?.data || [];
  const meta = data?.meta || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-dm-serif text-brand-forest mb-1">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">View all orders and associated referral contributions.</p>
      </div>

      <div className="bg-white shadow-sm border border-brand-sage/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">PIC / Referral Code</th>
                <th className="px-6 py-4 font-semibold">Contribution</th>
                <th className="px-6 py-4 font-semibold">Date</th>
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
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">#{order.shopifyOrderNum}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{formatCurrency(order.orderAmount)}</td>
                    <td className="px-6 py-4">
                      {order.pic ? (
                        <>
                          <p className="text-gray-900 font-medium">{order.pic.fullName}</p>
                          <p className="text-brand-forest text-xs font-medium">{order.referralCode}</p>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">Direct (No referral)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-brand-gold font-bold">
                      {order.commissionAmount > 0 ? formatCurrency(order.commissionAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Showing page {meta.page} of {meta.totalPages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrev} className="px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 font-medium transition-colors">Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={!meta.hasNext} className="px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 font-medium transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
