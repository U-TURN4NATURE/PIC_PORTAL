"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, AlertCircle, Search, FileText, Trash2 } from 'lucide-react';

export default function AdminPoliciesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingPolicy, setUploadingPolicy] = useState(false);
  const [resettingPolicy, setResettingPolicy] = useState(false);
  
  const [policies, setPolicies] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [policyRes, logsRes] = await Promise.all([
        api.get('/admin/policies'),
        api.get('/admin/policies/logs')
      ]);
      
      if (policyRes.data.data) setPolicies(policyRes.data.data);
      if (logsRes.data.data) setLogs(logsRes.data.data);
    } catch (error) {
      console.error('Failed to load policies data', error);
      toast.error('Failed to load policies data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePolicyUpload = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('document');
    if (!file || (file as File).size === 0) {
      return toast.error('Please select a file to upload');
    }
    
    try {
      setUploadingPolicy(true);
      await api.post('/admin/policies/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Policy uploaded successfully');
      
      const policyRes = await api.get('/admin/policies');
      if (policyRes.data.data) setPolicies(policyRes.data.data);
      e.target.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload policy');
    } finally {
      setUploadingPolicy(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/admin/policies/${id}`);
      toast.success('Policy deleted successfully');
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete policy');
    }
  };

  const handleResetAcceptance = async () => {
    if (!confirm('Are you sure? This will force all active PICs to re-accept the policies upon their next login.')) return;
    try {
      setResettingPolicy(true);
      const res = await api.post('/admin/policies/reset-acceptance');
      toast.success(res.data.message || 'Policy acceptance reset successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset policy acceptance');
    } finally {
      setResettingPolicy(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.pic?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.document?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-gray-500 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading policies...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Legal & Policies</h1>
        <p className="text-gray-500 text-sm mt-1">Manage Terms & Conditions, PIC Policies, and view PIC acceptance records.</p>
      </div>

      <div className="bg-white border border-brand-sage/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-forest/10 text-brand-forest rounded-xl border border-brand-sage/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload New Policy</h2>
              <p className="text-sm text-gray-500">Add or update legal documents.</p>
            </div>
          </div>
          <button
            onClick={handleResetAcceptance}
            disabled={resettingPolicy}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold rounded-lg flex items-center transition-colors disabled:opacity-50"
          >
            {resettingPolicy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
            Require Re-Acceptance
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Upload Form</h3>
              <form onSubmit={handlePolicyUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select name="type" required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="PIC_POLICY">PIC Policy</option>
                    <option value="TERMS_CONDITIONS">Terms & Conditions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" required placeholder="e.g. PIC Policy v2.0" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input name="version" required defaultValue="1.0" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF Document</label>
                  <input type="file" name="document" accept=".pdf" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-forest/10 file:text-brand-forest hover:file:bg-brand-forest/20" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isRequired" id="isRequired" value="true" defaultChecked className="w-4 h-4 text-brand-forest" />
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">Is Required? (Blocks PIC until accepted)</label>
                </div>
                <button type="submit" disabled={uploadingPolicy} className="w-full py-2 bg-brand-forest text-white rounded-lg font-medium flex items-center justify-center hover:bg-brand-forest/90">
                  {uploadingPolicy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Upload Document
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Current Active Policies</h3>
              {policies.length === 0 ? (
                <p className="text-sm text-gray-500">No policies uploaded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {policies.map(p => (
                    <li key={p.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{p.title}</span>
                        <span className="text-xs bg-brand-forest/10 text-brand-forest px-2 py-1 rounded-md">{p.type}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-between mt-2">
                        <span>Version: {p.version}</span>
                        <div className="flex items-center gap-3">
                          <a href={p.fileUrl} target="_blank" rel="noreferrer" className="text-brand-forest hover:underline font-medium text-xs flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            View PDF
                          </a>
                          <button
                            onClick={() => handleDeletePolicy(p.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Delete Policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Records */}
      <div className="bg-white border border-brand-sage/20 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <FileText className="w-5 h-5 text-brand-forest" /> Policy Acceptance Records
            </h2>
            <p className="text-sm text-gray-500 mt-1">Audit log of all legal policy acceptances by PIC partners.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search PIC or Policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-brand-forest/30 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">PIC Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No acceptance records found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.pic?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{log.pic?.email}</div>
                      <div className="text-xs text-gray-500">{log.pic?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-brand-forest">{log.document?.title}</div>
                      <div className="text-xs text-gray-500">v{log.document?.version}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 bg-gray-50 rounded px-2">{log.ipAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {new Date(log.acceptedAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
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
