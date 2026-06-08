"use client";

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ShieldAlert, AlertCircle, FileText } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PolicyModalProps {
  onAccept: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

export default function PolicyModal({ onAccept }: PolicyModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  // ── Fetch the PDF via the protected backend endpoint ──────────────────────
  // The file is NOT in the public folder. The backend verifies the PIC is
  // ACTIVE before streaming the PDF. This prevents unauthenticated access.
  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchPolicy = async () => {
      try {
        setLoadState('loading');

        const response = await api.get('/pic/policy-document', {
          responseType: 'blob', // receive raw binary
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setLoadState('ready');
      } catch (err: any) {
        console.error('Policy document fetch failed:', err);
        setLoadState('error');
      }
    };

    fetchPolicy();

    // Cleanup the object URL when the modal unmounts
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await api.post('/pic/accept-policy');
      toast.success('Policy accepted successfully!');
      onAccept();
    } catch {
      toast.error('Failed to accept policy. Please try again.');
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-brand-forest/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-forest to-brand-olive p-6 text-white shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-brand-gold" />
            <h2 className="text-2xl font-dm-serif">Welcome to U-Turn4Nature</h2>
          </div>
          <p className="text-brand-sage/90 text-sm">
            Congratulations on your approval! Please read and accept the confidential PIC Policy Document to access your dashboard.
          </p>
        </div>

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-50 flex flex-col gap-4">

          {/* PDF Frame */}
          <div className="flex-1 w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner relative">

            {/* Loading state */}
            {loadState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
                <p className="text-gray-500 text-sm font-medium">Loading your confidential policy document...</p>
              </div>
            )}

            {/* Error state */}
            {loadState === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Unable to load policy document</p>
                  <p className="text-gray-500 text-sm">
                    Your account may not be fully activated yet, or there was a network error.
                    Please contact <a href="mailto:support@u-turn.in" className="text-brand-forest underline">support@u-turn.in</a> if this persists.
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-brand-forest text-white text-sm font-semibold rounded-lg hover:bg-brand-forest/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* PDF loaded */}
            {loadState === 'ready' && pdfUrl && (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full min-h-[400px]"
                title="PIC Policy Document (Confidential)"
              />
            )}
          </div>

          {/* Confidentiality notice */}
          <div className="shrink-0 flex items-start gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg">
            <FileText className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">
              This document is <strong>strictly confidential</strong> and issued exclusively to you. Do not share, copy or distribute it.
            </p>
          </div>

          {/* Agreement Checkbox */}
          {loadState === 'ready' && (
            <div className="shrink-0 flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 text-brand-forest rounded border-gray-300 focus:ring-brand-forest cursor-pointer accent-brand-forest"
              />
              <label htmlFor="agree-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer leading-snug">
                I have read, fully understood, and agree to the Partner in Change (PIC) Policy. I acknowledge this document is confidential and I will not share it with any third party.
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 italic">
            {loadState === 'loading' && 'Please wait while your document loads...'}
            {loadState === 'error' && 'Document failed to load. Please retry.'}
            {loadState === 'ready' && (!hasAgreed ? 'Please check the box above to proceed.' : 'Thank you for reading the policy.')}
          </p>
          <button
            onClick={handleAccept}
            disabled={isAccepting || !hasAgreed || loadState !== 'ready'}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-md
              ${hasAgreed && loadState === 'ready'
                ? 'bg-brand-forest text-white hover:bg-brand-forest/90 hover:shadow-lg shadow-brand-forest/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isAccepting ? 'Accepting...' : 'I Agree & Accept Policy'}
          </button>
        </div>

      </div>
    </div>
  );
}
