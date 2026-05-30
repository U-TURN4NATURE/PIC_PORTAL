"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { TrendingUp, IndianRupee, ShoppingCart, Calendar } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pic/dashboard'),
      api.get('/pic/referral'),
    ]).then(([statsRes, refRes]) => {
      setData({ stats: statsRes.data.data, referral: refRes.data.data });
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-brand-sage/20" />)}
    </div>;
  }

  const wallet = data?.stats?.wallet || {};
  const orders = data?.stats?.recentOrders || [];
  const thisMonth = orders.filter((o: any) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Build chart data from recent orders
  const chartData = orders.slice().reverse().map((o: any) => ({
    date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    commission: o.commissionAmount,
    order: o.orderAmount,
  }));

  const kpis = [
    { label: 'Total Earned', value: formatCurrency(wallet.totalEarnings || 0), icon: IndianRupee, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Total Orders', value: data?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'This Month Orders', value: thisMonth.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg. Commission', value: formatCurrency(orders.length > 0 ? (wallet.totalEarnings / orders.length) : 0), icon: TrendingUp, color: 'text-brand-forest', bg: 'bg-brand-forest/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Analytics</h1>
        <p className="text-gray-500">Track your performance and earnings trends.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-brand-sage/30 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Trend */}
      {chartData.length > 0 ? (
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-6">Commission Trend (Recent Orders)</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D5016" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2D5016" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => [formatCurrency(Number(v) || 0), 'Commission']}
                />
                <Area type="monotone" dataKey="commission" stroke="#2D5016" strokeWidth={2.5} fill="url(#commGrad)" dot={{ fill: '#2D5016', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-12 shadow-sm text-center">
          <TrendingUp className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No data yet</p>
          <p className="text-gray-300 text-sm mt-1">Start sharing your referral link to see analytics here</p>
        </div>
      )}

      {/* Order Value vs Commission Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-brand-sage/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-6">Order Value vs Your Commission</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  formatter={(v: number, name: string) => [formatCurrency(v), name === 'order' ? 'Order Value' : 'Your Commission']}
                />
                <Bar dataKey="order" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="order" />
                <Bar dataKey="commission" fill="#2D5016" radius={[4, 4, 0, 0]} name="commission" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
