"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Loader2, AlertCircle } from 'lucide-react';


export default function PICPolicyPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const objectRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    const loadPolicy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the api instance (axios) so the JWT Authorization header is sent automatically
        // Raw fetch() doesn't attach the Bearer token and fails in production (cross-domain cookies blocked)
        const response = await api.get('/pic/policy-document', {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url + '#toolbar=0');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Could not load the policy document. Please try again.';
        setError(msg);
        toast.error('Failed to load policy document');
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicy();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-forest" />
            </div>
            PIC Policy Document
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review the official U-Turn4Nature Partner in Commerce policy
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
            <p className="text-gray-500 text-sm">Loading policy document...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Failed to Load Document</h3>
              <p className="text-gray-500 text-sm max-w-sm">{error}</p>
            </div>
            <button
              id="retry-policy-btn"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-forest text-white text-sm font-medium rounded-xl hover:bg-brand-forest/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {pdfUrl && !isLoading && (
          <>
            {/* Inline PDF viewer */}
            <object
              ref={objectRef}
              data={pdfUrl}
              type="application/pdf"
              id="policy-pdf-viewer"
              className="w-full"
              style={{ height: 'calc(100vh - 260px)', minHeight: '600px' }}
            >
              {/* Fallback for browsers that don't support inline PDF */}
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <FileText className="w-12 h-12 text-gray-300" />
                <p className="text-gray-600 font-medium">Your browser does not support inline PDF viewing.</p>
                <p className="text-gray-400 text-sm">Please use a modern browser (Chrome, Edge, Firefox) to view the policy document.</p>
              </div>
            </object>
          </>
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 bg-brand-sage/10 border border-brand-sage/30 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
        <p className="text-sm text-brand-forest/80">
          This policy document is confidential and intended solely for approved PIC Partners of U-Turn4Nature. 
          Please do not share or distribute this document.
        </p>
      </div>
    </div>
  );
}
