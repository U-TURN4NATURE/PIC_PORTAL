"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100"></div>)}
      </div>
      <div className="h-96 bg-white rounded-2xl border border-gray-100 mt-6"></div>
    </div>;
  }

  const kpis = [
    { title: 'Total Revenue', value: formatCurrency(stats?.stats?.totalRevenue || 0), icon: IndianRupee, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { title: 'Contributions Paid', value: formatCurrency(stats?.stats?.totalCommissionPaid || 0), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Total Orders', value: stats?.stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Active PICs', value: stats?.stats?.activePICs || 0, icon: UserCheck, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { title: 'Pending Approvals', value: stats?.stats?.pendingPICs || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Total PICs', value: stats?.stats?.totalPICs || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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
          <div key={index} className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl p-6 hover:border-brand-sage/40 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-brand-olive font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>Up from last month</span>
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
            {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B7280" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#111827' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
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
            <a href="/admin/pics" className="text-sm font-semibold text-brand-gold hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {stats?.recentPICs?.length > 0 ? (
              stats.recentPICs.map((pic: any) => (
                <div key={pic.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest font-bold border border-brand-sage/30">
                      {pic.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{pic.fullName}</p>
                      <p className="text-xs text-gray-500">{new Date(pic.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      pic.status === 'APPROVED' ? 'badge-approved' :
                      pic.status === 'PENDING' ? 'badge-pending' :
                      pic.status === 'REJECTED' ? 'badge-rejected' :
                      'badge-suspended'
                    }`}>
                      {pic.status}
                    </span>
                  </div>
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
