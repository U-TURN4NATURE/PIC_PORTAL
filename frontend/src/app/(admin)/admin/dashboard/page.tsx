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
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>)}
      </div>
      <div className="h-96 bg-gray-800 rounded-2xl mt-6"></div>
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
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>Up from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue & Contribution Trends</h3>
          <div className="h-[300px] w-full">
            {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="month" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#F3F4F6' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                  ><Bar dataKey="commission" name="Contribution Paid" fill="#2D5016" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No revenue data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent PICs */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent PIC Partners</h3>
            <a href="/admin/pics" className="text-sm text-brand-gold hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {stats?.recentPICs?.length > 0 ? (
              stats.recentPICs.map((pic: any) => (
                <div key={pic.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                      {pic.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[120px]">{pic.fullName}</p>
                      <p className="text-xs text-gray-400">{new Date(pic.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      pic.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                      pic.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                      pic.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {pic.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No recent partners</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
