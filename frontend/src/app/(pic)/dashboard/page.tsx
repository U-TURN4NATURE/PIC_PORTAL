"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Wallet,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Copy,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function PICDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await api.get('/pic/dashboard');
        setStats(statsRes.data.data);
      } catch (err: any) {
        // Gracefully handle errors (e.g. no wallet yet for newly approved users)
        if (err?.response?.status !== 404) {
          toast.error('Failed to load dashboard data');
        }
        setStats({ wallet: {}, totalOrders: 0, recentOrders: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-white rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const wallet = stats?.wallet || {};
  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden bg-gradient-to-r from-brand-forest/90 to-brand-olive border-none">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl font-dm-serif text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}! 🌱
          </h1>
          <p className="text-brand-beige/90 max-w-xl">
            Track your earnings, manage your referrals, and view your partner account here.
          </p>
          <div className="mt-8">
            <Link href="/dashboard/referral" className="bg-brand-gold hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2.5 rounded-lg transition-colors inline-block">
              Add New Referral
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Available Balance"
          value={formatCurrency(wallet.availableBalance || 0)}
          icon={<Wallet className="w-5 h-5" />}
          iconBg="bg-brand-forest/10 text-brand-forest"
          footer={<Link href="/dashboard/wallet" className="text-sm text-brand-forest font-medium flex items-center hover:underline">Request Payout <ArrowRight className="w-4 h-4 ml-1" /></Link>}
        />
        <KPICard
          label="Total Earnings"
          value={formatCurrency(wallet.totalEarnings || 0)}
          icon={<IndianRupee className="w-5 h-5" />}
          iconBg="bg-brand-gold/20 text-yellow-700"
          footer={<p className="text-xs text-gray-500">Lifetime contribution earned</p>}
        />
        <KPICard
          label="Pending Earnings"
          value={formatCurrency(wallet.pendingEarnings || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-orange-100 text-orange-600"
          footer={<p className="text-xs text-gray-500">Currently processing</p>}
        />
        <KPICard
          label="Total Orders"
          value={String(stats?.totalOrders || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          iconBg="bg-blue-100 text-blue-600"
          footer={<Link href="/dashboard/orders" className="text-sm text-brand-forest font-medium flex items-center hover:underline">View Orders <ArrowRight className="w-4 h-4 ml-1" /></Link>}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-brand-sage/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-sage/20 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent Referred Orders</h3>
          <Link href="/dashboard/orders" className="text-sm font-medium text-brand-forest hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-sage/10 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Order Amount</th>
                <th className="px-6 py-4 font-medium">Contribution</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/20">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No orders referred yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Add a new referral to start earning!</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-brand-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.shopifyOrderId}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.orderAmount)}</td>
                    <td className="px-6 py-4 font-bold text-brand-forest">+{formatCurrency(order.commissionAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                        {order.status}
                      </span>
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

function KPICard({ label, value, icon, iconBg, footer }: {
  label: string; value: string; icon: React.ReactNode; iconBg: string; footer: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-sage/30 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      {footer}
    </div>
  );
}
