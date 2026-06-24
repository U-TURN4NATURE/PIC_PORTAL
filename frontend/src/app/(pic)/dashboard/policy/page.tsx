"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

interface PolicyDocument {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  version: string;
  isRequired: boolean;
}

export default function PICPolicyPage() {
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [activePolicy, setActivePolicy] = useState<PolicyDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get('/pic/policies');
        const data = res.data.data || []; 
        
        // Add static default policy if no PIC_POLICY exists
        const hasPicPolicy = data.some((p: PolicyDocument) => p.type === 'PIC_POLICY');
        const policiesList = hasPicPolicy ? data : [
          {
            id: 'STATIC_PIC_POLICY',
            title: 'PIC Policy',
            type: 'PIC_POLICY',
            fileUrl: '/pic/policy-document',
            version: '1.0',
            isRequired: true
          },
          ...data
        ];
        
        setPolicies(policiesList);
        if (policiesList.length > 0) {
          setActivePolicy(policiesList[0]);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Could not load the policies. Please try again.';
        setError(msg);
        toast.error('Failed to load policies');
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicies();
  }, []);

  // Fetch blob if active policy requires auth
  useEffect(() => {
    if (!activePolicy) return;
    
    // Revoke previous blob url
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [activePolicy]);

  useEffect(() => {
    const loadPdfBlob = async () => {
      if (!activePolicy) return;
      
      const isProtected = activePolicy.fileUrl.startsWith('/pic') || activePolicy.fileUrl.startsWith('/api');
      if (!isProtected) {
        setPdfBlobUrl(activePolicy.fileUrl);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await api.get(activePolicy.fileUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (err) {
        console.error('Failed to load protected PDF', err);
        setError('Failed to load the policy document content.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPdfBlob();
  }, [activePolicy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-forest" />
            </div>
            Policy & Terms and Conditions
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review the official U-Turn4Nature documents and guidelines
          </p>
        </div>
      </div>

      {/* Tabs */}
      {!isLoading && policies.length > 0 && (
        <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 overflow-x-auto hide-scrollbar">
          {policies.map(policy => (
            <button
              key={policy.id}
              onClick={() => setActivePolicy(policy)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activePolicy?.id === policy.id
                  ? 'bg-brand-forest text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {policy.title} {policy.version ? `(v${policy.version})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* PDF Viewer */}
      <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
            <p className="text-gray-500 text-sm">Loading documents...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Failed to Load Documents</h3>
              <p className="text-gray-500 text-sm max-w-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-forest text-white text-sm font-medium rounded-xl hover:bg-brand-forest/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && policies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <FileText className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm">No policy documents available at the moment.</p>
          </div>
        )}

        {!isLoading && activePolicy && pdfBlobUrl && (
          <iframe
            src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
            className="w-full"
            style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
            title={activePolicy.title}
          />
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 bg-brand-sage/10 border border-brand-sage/30 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
        <p className="text-sm text-brand-forest/80">
          These documents are confidential and intended solely for approved PIC Partners of U-Turn4Nature. 
          Please do not share or distribute them.
        </p>
      </div>
    </div>
  );
}
