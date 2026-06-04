"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Store, Loader2, Save, Key, Link as LinkIcon, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    </div>
  );
}
