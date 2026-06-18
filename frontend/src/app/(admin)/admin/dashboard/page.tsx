"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/lib/useApi';
import api from '@/lib/api';
import type { AdminDashboardStats } from '@/lib/api-types';
import {
  Users,
  UserCheck,
  Clock,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const { data: statsData, isLoading, error } = useApi<AdminDashboardStats>(
    () => api.get('/admin/dashboard').then((r) => r.data.data),
    []
  );

  if (error) {
    toast.error(`Failed to load dashboard: ${error}`);
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-gray-100 mt-6" />
      </div>
    );
  }

  const stats = statsData?.stats;
  const trends = statsData?.trends;

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10',
      trend: trends?.totalRevenue,
    },
    {
      title: 'Contributions Paid',
      value: formatCurrency(stats?.totalCommissionPaid || 0),
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: trends?.totalCommission,
    },
    {
      title: 'Total Orders',
      value: String(stats?.totalOrders || 0),
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: trends?.totalOrders,
    },
    {
      title: 'Active PICs',
      value: String(stats?.activePICs || 0),
      icon: UserCheck,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10',
      trend: trends?.activePICs,
    },
    {
      title: 'Pending Approvals',
      value: String(stats?.pendingPICs || 0),
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      trend: trends?.pendingPICs,
    },
    {
      title: 'Total PICs',
      value: String(stats?.totalPICs || 0),
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: trends?.totalPICs,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6 hover:border-brand-sage/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium">
              <TrendBadge trend={kpi.trend} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
          <h3 className="text-lg font-bold text-brand-forest mb-6">Revenue & Contribution Trends</h3>
          <div className="h-[300px] w-full">
            {statsData?.monthlyRevenue && statsData.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsData.monthlyRevenue}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" axisLine={false} tickLine={false} />
                  <YAxis
                    stroke="#6B7280"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: '#111827' }}
                    formatter={(value) => [formatCurrency(value != null ? Number(value) : 0), '']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" name="Contribution Paid" fill="#2D5016" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No revenue data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent PICs */}
        <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-forest">Recent PIC Partners</h3>
            <a href="/admin/pics" className="text-sm font-semibold text-brand-gold hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-4">
            {statsData?.recentPICs && statsData.recentPICs.length > 0 ? (
              statsData.recentPICs.map((pic) => (
                <div
                  key={pic.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest font-bold border border-brand-sage/30">
                      {pic.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                        {pic.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pic.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      pic.status === 'APPROVED'
                        ? 'badge-approved'
                        : pic.status === 'PENDING'
                        ? 'badge-pending'
                        : pic.status === 'REJECTED'
                        ? 'badge-rejected'
                        : 'badge-suspended'
                    }`}
                  >
                    {pic.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4 font-medium">No recent partners</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trend Badge Component ──────────────────────────────────────────────────

function TrendBadge({ trend }: { trend?: { change: number; trend: string } }) {
  if (!trend) return <span className="text-gray-400 text-xs">No data yet</span>;

  if (trend.trend === 'flat' || trend.change === 0) {
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Minus className="w-3.5 h-3.5" />
        <span className="text-xs">No change this month</span>
      </span>
    );
  }

  if (trend.trend === 'up') {
    return (
      <span className="flex items-center gap-1 text-green-600">
        <TrendingUp className="w-3.5 h-3.5" />
        <span className="text-xs">+{trend.change}% this month</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-red-500">
      <TrendingDown className="w-3.5 h-3.5" />
      <span className="text-xs">-{trend.change}% this month</span>
    </span>
  );
}
