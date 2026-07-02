"use client";

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ShieldAlert, AlertCircle, FileText } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PolicyModalProps {
  onAccept: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

interface PolicyDocument {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  version: string;
  isRequired: boolean;
}

export default function PolicyModal({ onAccept }: PolicyModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [activePolicy, setActivePolicy] = useState<PolicyDocument | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoadState('loading');
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
        setLoadState('ready');
      } catch (err: any) {
        console.error('Policies fetch failed:', err);
        setLoadState('error');
      }
    };

    fetchPolicies();
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
      
      setLoadState('loading');
      try {
        const isExternal = activePolicy.fileUrl.startsWith('http');
        let blob: Blob;
        
        if (isExternal) {
          const response = await fetch(activePolicy.fileUrl);
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          blob = await response.blob();
        } else {
          const response = await api.get(activePolicy.fileUrl, { responseType: 'blob' });
          blob = new Blob([response.data], { type: 'application/pdf' });
        }
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoadState('ready');
      } catch (err) {
        console.error('Failed to load protected PDF', err);
        setLoadState('error');
      }
    };
    
    loadPdfBlob();
  }, [activePolicy]);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await api.post('/pic/accept-policy');
      toast.success('Policy and Terms & Conditions accepted successfully!');
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
            <h2 className="text-2xl font-dm-serif">Legal Agreements</h2>
          </div>
          <p className="text-brand-sage/90 text-sm">
            Please read and accept the confidential PIC Policy and Terms & Conditions to access your dashboard.
          </p>
        </div>

        {/* Tabs */}
        {loadState === 'ready' && policies.length > 1 && (
          <div className="px-6 pt-4 bg-gray-50 shrink-0">
            <div className="flex gap-2">
              {policies.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => setActivePolicy(policy)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activePolicy?.id === policy.id
                      ? 'bg-white text-brand-forest border-t border-l border-r border-gray-200'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  {policy.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-50 flex flex-col gap-4">

          {/* PDF Frame */}
          <div className="flex-1 w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner relative">

            {/* Loading state */}
            {loadState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="w-10 h-10 text-brand-forest animate-spin" />
                <p className="text-gray-500 text-sm font-medium">Loading your confidential documents...</p>
              </div>
            )}

            {/* Error state */}
            {loadState === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Unable to load documents</p>
                  <p className="text-gray-500 text-sm">
                    There was a network error. Please contact <a href="mailto:support@u-turn.in" className="text-brand-forest underline">support@u-turn.in</a> if this persists.
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
            {loadState === 'ready' && activePolicy && pdfBlobUrl && (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full min-h-[400px]"
                title={activePolicy.title}
              />
            )}
            
            {loadState === 'ready' && policies.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
                <p className="text-gray-500 text-sm font-medium">No mandatory policies require your attention at this time.</p>
              </div>
            )}
          </div>

          {/* Confidentiality notice */}
          <div className="shrink-0 flex items-start gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg">
            <FileText className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">
              These documents are <strong>strictly confidential</strong>. Do not share, copy or distribute them.
            </p>
          </div>

          {/* Agreement Checkbox */}
          {loadState === 'ready' && policies.length > 0 && (
            <div className="shrink-0 flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 text-brand-forest rounded border-gray-300 focus:ring-brand-forest cursor-pointer accent-brand-forest"
              />
              <label htmlFor="agree-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer leading-snug">
                I have read, fully understood, and agree to the {policies.map(p => p.title).join(' and ')}. I acknowledge these documents are confidential.
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 italic">
            {loadState === 'loading' && 'Please wait while documents load...'}
            {loadState === 'error' && 'Failed to load. Please retry.'}
            {loadState === 'ready' && policies.length > 0 && (!hasAgreed ? 'Please check the box above to proceed.' : 'Thank you for reading the documents.')}
            {loadState === 'ready' && policies.length === 0 && 'You can proceed.'}
          </p>
          <button
            onClick={policies.length === 0 ? onAccept : handleAccept}
            disabled={policies.length > 0 && (isAccepting || !hasAgreed || loadState !== 'ready')}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-md
              ${(policies.length === 0 || (hasAgreed && loadState === 'ready'))
                ? 'bg-brand-forest text-white hover:bg-brand-forest/90 hover:shadow-lg shadow-brand-forest/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isAccepting ? 'Accepting...' : 'I Agree & Accept'}
          </button>
        </div>

      </div>
    </div>
  );
}
