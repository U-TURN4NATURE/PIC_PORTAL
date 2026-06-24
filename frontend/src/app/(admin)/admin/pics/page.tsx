"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, MoreVertical, Eye, CheckCircle, XCircle, Ban, Trash2, Download } from 'lucide-react';
import Link from 'next/link';

import useSWR from 'swr';
import { paginatedFetcher } from '@/lib/api';

export default function AdminPICsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search term to avoid spamming the API
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params = new URLSearchParams({ page: page.toString(), limit: '10' });
  if (debouncedSearch) params.append('search', debouncedSearch);
  if (statusFilter) params.append('status', statusFilter);

  const { data, isLoading, mutate: fetchPICs } = useSWR(`/admin/pics?${params.toString()}`, paginatedFetcher, {
    keepPreviousData: true,
  });

  const pics: any[] = data?.data || [];
  const meta = data?.meta || null;

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

  const handleExportCSV = () => {
    if (pics.length === 0) { toast.error('No data to export'); return; }
    const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Status', 'Referral Code', 'Total Earnings', 'Orders', 'Joined'];
    const rows = pics.map((p: any) => [
      p.fullName,
      p.email,
      p.phone,
      p.city,
      p.state,
      p.status,
      p.referralCode || '',
      p.wallet?.totalEarnings || 0,
      p._count?.orders || 0,
      new Date(p.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pic-partners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${pics.length} records`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">PIC Management</h1>
          <p className="text-gray-500">View and manage Partners in Change applications and accounts.</p>
        </div>
        <button
          id="export-pics-csv-btn"
          onClick={handleExportCSV}
          disabled={pics.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest/90 transition-colors disabled:opacity-50 shadow-sm shadow-brand-forest/20"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-brand-sage/20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest/50"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved (Profile Incomplete)</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-sage/20 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Partner Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Earnings</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
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
                  <tr key={pic.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest font-bold border border-brand-sage/30 shrink-0">
                          {pic.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{pic.fullName}</p>
                          {pic.referralCode && (
                            <p className="text-xs text-brand-forest mt-0.5 font-medium">Code: {pic.referralCode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 truncate max-w-[150px]">{pic.email}</p>
                      <p className="text-xs text-gray-500">{pic.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{pic.city}</p>
                      <p className="text-xs text-gray-500">{pic.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                        pic.status === 'ACTIVE' ? 'badge-approved' :
                        pic.status === 'APPROVED' ? 'badge-approved opacity-80' :
                        pic.status === 'PENDING' ? 'badge-pending' :
                        pic.status === 'REJECTED' ? 'badge-rejected' :
                        pic.status === 'SUSPENDED' ? 'badge-suspended' :
                        'badge-suspended'
                      }`}>
                        {pic.status === 'APPROVED' ? 'Profile Incomplete' : pic.status}
                      </span>
                      {!pic.isEmailVerified && pic.status === 'PENDING' && (
                         <p className="text-[10px] text-red-400 mt-1">Email unverified</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(pic.wallet?.totalEarnings || 0)}</p>
                      <p className="text-xs text-gray-500">{pic._count?.orders || 0} orders</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/pics/${pic.id}`} className="p-2 text-gray-400 hover:text-brand-forest hover:bg-brand-forest/10 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {pic.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleStatusAction(pic.id, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusAction(pic.id, 'reject')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {pic.status === 'APPROVED' && (
                          <button onClick={() => handleStatusAction(pic.id, 'suspend')} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Suspend">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button onClick={() => handleDelete(pic.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="px-3 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNext}
                className="px-3 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
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
