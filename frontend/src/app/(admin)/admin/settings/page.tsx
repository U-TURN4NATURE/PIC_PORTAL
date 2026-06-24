"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Store, Loader2, Save, Key, Link as LinkIcon, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [uploadingPolicy, setUploadingPolicy] = useState(false);
  const [resettingPolicy, setResettingPolicy] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/shopify/settings');
        if (res.data.data) {
          reset({
            storeName: res.data.data.storeName,
            storeUrl: res.data.data.storeUrl,
            // We intentionally don't set the sensitive keys here unless they are masked,
            // but for a simple save form, we'll leave them blank so they are only updated if typed.
          });
        }
      } catch (error) {
        toast.error('Failed to load Shopify settings');
      } 
      
      try {
        const policyRes = await api.get('/admin/policies');
        if (policyRes.data.data) {
          setPolicies(policyRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load policies', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      await api.post('/admin/shopify/settings', data);
      toast.success('Shopify settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

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
      // Refresh policies
      const policyRes = await api.get('/admin/policies');
      if (policyRes.data.data) setPolicies(policyRes.data.data);
      e.target.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload policy');
    } finally {
      setUploadingPolicy(false);
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

  if (isLoading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-dm-serif text-brand-forest mb-1">Shopify Integration</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your connection to Shopify for automated order tracking and webhooks.</p>
      </div>

      <div className="bg-white border border-brand-sage/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center space-x-4">
          <div className="p-3 bg-brand-forest/10 text-brand-forest rounded-xl border border-brand-sage/30">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Store Connection</h2>
            <p className="text-sm text-gray-500">API credentials will be securely encrypted in the database.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('storeName', { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="e.g. U-Turn4Nature Official"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('storeUrl', { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="e.g. uturn4nature.myshopify.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <hr className="border-gray-200 my-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Admin API Keys</h3>
              <p className="text-sm text-gray-500 mb-4">Required for fetching orders and generating discount codes.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('apiKey')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="Enter new API Key..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('apiSecret')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="Enter new API Secret..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('accessToken')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="shpat_..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <hr className="border-gray-200 my-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Webhook Configuration</h3>
              <p className="text-sm text-gray-500 mb-4">Required for receiving real-time order updates.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (HMAC verification)</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  {...register('webhookSecret')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-forest/30"
                  placeholder="Enter webhook secret..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Webhook URL: <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-brand-forest font-medium">https://[your-domain]/api/webhooks/shopify</code>
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3 bg-brand-gold hover:bg-yellow-500 text-gray-900 font-bold rounded-xl flex items-center transition-colors disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-brand-sage/20 rounded-2xl overflow-hidden shadow-sm mt-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-forest/10 text-brand-forest rounded-xl border border-brand-sage/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Legal Compliance & Policies</h2>
              <p className="text-sm text-gray-500">Upload Policy and Terms & Conditions documents.</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Upload New Document</h3>
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
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">Is Required?</label>
                </div>
                <button type="submit" disabled={uploadingPolicy} className="w-full py-2 bg-brand-forest text-white rounded-lg font-medium flex items-center justify-center">
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
                        <a href={p.fileUrl} target="_blank" rel="noreferrer" className="text-brand-forest hover:underline">View PDF</a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
