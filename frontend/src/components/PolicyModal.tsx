"use client";

import { useState } from 'react';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PolicyModalProps {
  onAccept: () => void;
}

export default function PolicyModal({ onAccept }: PolicyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await api.post('/pic/accept-policy');
      toast.success('Policy accepted successfully!');
      onAccept();
    } catch (error) {
      toast.error('Failed to accept policy. Please try again.');
      setIsLoading(false);
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
            Before you can access your dashboard, please read and accept our Partner in Change (PIC) Policy.
          </p>
        </div>

        {/* Content - PDF Viewer */}
        <div className="flex-1 overflow-hidden p-6 text-gray-700 bg-gray-50 flex flex-col relative">
          <div className="flex-1 w-full border rounded-xl overflow-hidden bg-white shadow-inner mb-4">
            <iframe 
              src="/policy.pdf#toolbar=0" 
              className="w-full h-full min-h-[400px]"
              title="PIC Policy Document"
            />
          </div>
          
          {/* Agreement Checkbox */}
          <div className="shrink-0 flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <input 
              type="checkbox" 
              id="agree-checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-brand-forest rounded border-gray-300 focus:ring-brand-forest cursor-pointer"
            />
            <label htmlFor="agree-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
              I have read, understood, and agree to the Partner in Change (PIC) Policy. I acknowledge that this document is confidential.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 italic">
            {!hasAgreed ? "Please check the box above to accept." : "Thank you for reading the policy."}
          </p>
          <button
            onClick={handleAccept}
            disabled={isLoading || !hasAgreed}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-md
              ${hasAgreed 
                ? 'bg-brand-forest text-white hover:bg-brand-forest/90 hover:shadow-lg shadow-brand-forest/20' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isLoading ? 'Accepting...' : 'I Agree & Accept'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

