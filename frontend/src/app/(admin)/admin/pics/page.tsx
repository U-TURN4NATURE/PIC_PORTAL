"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, MoreVertical, Eye, CheckCircle, XCircle, Ban, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPICsPage() {
  const [pics, setPics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  const fetchPICs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/pics?${params.toString()}`);
      setPics(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      toast.error('Failed to fetch PIC partners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPICs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, page]);

  const handleStatusAction = async (id: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      const reason = action !== 'approve' ? window.prompt(`Enter reason for ${action}ing this PIC:`) : '';
      if (action !== 'approve' && reason === null) return;

      await api.patch(`/admin/pics/${id}/${action}`, { reason });
      toast.success(`PIC ${action}d successfully`);
      fetchPICs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} PIC`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this PIC? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/pics/${id}`);
      toast.success('PIC deleted successfully');
      fetchPICs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete PIC');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">PIC Management</h1>
          <p className="text-gray-400">View and manage Partner In Charge applications and accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-white">Partner Name</th>
                <th className="px-6 py-4 font-medium text-white">Contact</th>
                <th className="px-6 py-4 font-medium text-white">Location</th>
                <th className="px-6 py-4 font-medium text-white">Status</th>
                <th className="px-6 py-4 font-medium text-white">Earnings</th>
                <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                    </div>
                  </td>
                </tr>
              ) : pics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No PIC partners found matching your criteria.
                  </td>
                </tr>
              ) : (
                pics.map((pic) => (
                  <tr key={pic.id} className="border-b border-gray-700 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold border border-gray-600 shrink-0">
                          {pic.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{pic.fullName}</p>
                          {pic.referralCode && (
                            <p className="text-xs text-brand-gold mt-0.5">Code: {pic.referralCode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 truncate max-w-[150px]">{pic.email}</p>
                      <p className="text-xs text-gray-500">{pic.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{pic.city}</p>
                      <p className="text-xs text-gray-500">{pic.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        pic.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        pic.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        pic.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {pic.status}
                      </span>
                      {!pic.isEmailVerified && pic.status === 'PENDING' && (
                         <p className="text-[10px] text-red-400 mt-1">Email unverified</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{formatCurrency(pic.wallet?.totalEarnings || 0)}</p>
                      <p className="text-xs text-gray-500">{pic._count?.orders || 0} orders</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/pics/${pic.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {pic.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleStatusAction(pic.id, 'approve')} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusAction(pic.id, 'reject')} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {pic.status === 'APPROVED' && (
                          <button onClick={() => handleStatusAction(pic.id, 'suspend')} className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-colors" title="Suspend">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button onClick={() => handleDelete(pic.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <span className="text-sm text-gray-400">
              Showing page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNext}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
