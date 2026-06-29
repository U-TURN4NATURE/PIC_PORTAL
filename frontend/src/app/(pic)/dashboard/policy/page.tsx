"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Loader2, AlertCircle, Download, ExternalLink } from 'lucide-react';

interface PolicyDocument {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  version: string;
  isRequired: boolean;
}

// The static default policy pointing to the protected backend route
const STATIC_POLICY: PolicyDocument = {
  id: 'STATIC_PIC_POLICY',
  title: 'PIC Policy Document',
  type: 'PIC_POLICY',
  fileUrl: '/pic/policy-document',
  version: '1.0',
  isRequired: true,
};

export default function PICPolicyPage() {
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [activePolicy, setActivePolicy] = useState<PolicyDocument | null>(null);
  const [isPoliciesLoading, setIsPoliciesLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Cleanup blob URLs to avoid memory leaks
  const prevBlobUrl = useRef<string | null>(null);

  // ── Step 1: Load list of policies ──────────────
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await api.get('/pic/policies');
        const data: PolicyDocument[] = res.data.data || [];

        // If no PIC_POLICY in DB, insert the static one
        const hasPicPolicy = data.some((p) => p.type === 'PIC_POLICY');
        const list = hasPicPolicy ? data : [STATIC_POLICY, ...data];

        setPolicies(list);
        setActivePolicy(list[0] ?? null);
      } catch {
        // Even on error, show the static policy so users are never stuck
        setPolicies([STATIC_POLICY]);
        setActivePolicy(STATIC_POLICY);
      } finally {
        setIsPoliciesLoading(false);
      }
    };

    loadPolicies();
  }, []);

  // ── Step 2: Load PDF blob whenever activePolicy changes ──
  useEffect(() => {
    if (!activePolicy) return;

    // Revoke previous blob to free memory
    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current);
      prevBlobUrl.current = null;
    }
    setPdfBlobUrl(null);
    setPdfError(null);

    const loadPdf = async () => {
      setIsPdfLoading(true);
      try {
        // All our policy URLs are protected API routes (/pic/...) so always use api client
        const response = await api.get(activePolicy.fileUrl, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        prevBlobUrl.current = url;
        setPdfBlobUrl(url);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          setPdfError('Access denied. Only active PIC Partners can view this document.');
        } else if (status === 404) {
          setPdfError('Policy document not found. Please contact support.');
        } else {
          setPdfError('Failed to load the policy document. Please try again.');
        }
      } finally {
        setIsPdfLoading(false);
      }
    };

    loadPdf();

    // Cleanup on unmount
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current);
      }
    };
  }, [activePolicy?.id]);

  const handleRetry = () => {
    if (activePolicy) {
      // Re-trigger by creating a new ref
      const copy = { ...activePolicy };
      setActivePolicy(null);
      setTimeout(() => setActivePolicy(copy), 50);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand-forest" />
          </div>
          Policy &amp; Terms and Conditions
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Review the official U-Turn4Nature documents and guidelines
        </p>
      </div>

      {/* Policy Tabs */}
      {!isPoliciesLoading && policies.length > 1 && (
        <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 overflow-x-auto">
          {policies.map((policy) => (
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

      {/* PDF Viewer Card */}
      <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm overflow-hidden">

        {/* Loading policies */}
        {isPoliciesLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
            <p className="text-gray-500 text-sm">Loading documents...</p>
          </div>
        )}

        {/* Loading PDF */}
        {!isPoliciesLoading && isPdfLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
            <p className="text-gray-500 text-sm">Loading policy document...</p>
          </div>
        )}

        {/* PDF Error */}
        {!isPoliciesLoading && !isPdfLoading && pdfError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Could Not Load Document</h3>
              <p className="text-gray-500 text-sm max-w-sm">{pdfError}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-brand-forest text-white text-sm font-medium rounded-xl hover:bg-brand-forest/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PDF iframe */}
        {!isPoliciesLoading && !isPdfLoading && !pdfError && pdfBlobUrl && (
          <>
            {/* Top action bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-brand-sage/20 bg-brand-forest/5">
              <p className="text-sm font-medium text-brand-forest">
                {activePolicy?.title} {activePolicy?.version ? `— v${activePolicy.version}` : ''}
              </p>
              <a
                href={pdfBlobUrl}
                download="PIC-Policy-Document.pdf"
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>

            <iframe
              src={`${pdfBlobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full"
              style={{ height: 'calc(100vh - 280px)', minHeight: '640px' }}
              title={activePolicy?.title || 'Policy Document'}
            />
          </>
        )}
      </div>

      {/* Confidentiality note */}
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
