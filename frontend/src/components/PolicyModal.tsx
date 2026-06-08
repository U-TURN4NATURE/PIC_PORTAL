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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom) {
      setHasScrolledToBottom(true);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
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

        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-gray-700 text-sm leading-relaxed space-y-6"
          onScroll={handleScroll}
        >
          <div className="prose prose-sm max-w-none text-gray-700">
            <h3 className="text-xl font-bold text-brand-forest text-center mb-6">
              PIC Policy Document India2026<br />
              <span className="text-sm font-normal text-gray-500">This document is strictly confidential and nontransferable</span>
            </h3>

            <div className="text-center mb-8">
              <h4 className="text-lg font-bold">Partner in Change (PIC)<br />Earn with Purpose</h4>
              <p className="italic text-brand-olive">"Build a Lifetime Business. Create Lasting Impact"</p>
              <p className="font-semibold text-brand-forest">#100MillionWomen</p>
            </div>

            <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">About U-Turn4Nature – The Homemade Revolution of India</h4>
            <p>U-Turn4Nature is India's first exclusive pure homemade grocery brand, created by thousands of rural women SHGs / FPOs / Co-operatives in their own villages. What began as a simple effort to empower women entrepreneurs in creating authentic homemade atta, oils, snacks, spices, and state-special traditional products have today evolved into a National social enterprise movement.</p>
            <p><strong>Our mission is simple yet powerful:</strong> Bring real homemade food to Indian homes while creating dignified livelihoods for rural women.</p>

            <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Our Proven Model</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Built after 4+ years of R&amp;D, 50+ pilot campaigns, and 1,00+ innovations</li>
              <li>Operates across 500+ retail &amp; D2C touchpoints</li>
              <li>97% customer prefer for homemade food</li>
              <li>Strong repeat purchases sustained for till date without paid advertising</li>
            </ul>

            <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Partners in Change (PIC) – Growing Together</h4>
            <p>The Partners in Change (PIC) program invites individuals and organizations to become co-builders of this movement.</p>
            <p className="font-semibold text-red-600">PICs are not sales agents.</p>
            <p>PIC Women are Co-Partners and Ambassadors who promote the values of homemade food and rural women empowerment by connecting families and communities with authentic products while mentoring rural entrepreneurs and their family members.</p>

            <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Benefits Of PIC</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Payout on every product purchased by their contact lifelong.</li>
              <li>No delivery responsibility for PICs</li>
              <li>Zero inventory holding required</li>
              <li>Special discounted pricing for purchases</li>
              <li>Earning continued even after PIC left the work due to any reason.</li>
            </ul>

            <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mt-8">Independent Entrepreneur Policy</h4>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>PIC Status:</strong> A Partner in Change (PIC) is an independent entrepreneur associated with U-Turn4Nature for promoting homemade products, healthy food choices, and rural women entrepreneurship. PICs are not employees of U-Turn4Nature, not sales agents, not distributors, not franchisees.
              </li>
              <li>
                <strong>No Inventory Requirement:</strong> PICs are not required to purchase stock, maintain inventory, rent office space, or meet monthly sales targets.
              </li>
              <li>
                <strong>Ethical Promotion Standards:</strong> PICs shall share only approved product information, use truthful communication, respect customer privacy, and avoid misleading health or income claims.
              </li>
              <li>
                <strong>Taxation Responsibility:</strong> PICs operate as independent entrepreneurs. Therefore, PICs are responsible for their own Income Tax compliance and GST registration requirements if applicable. U-Turn4Nature may deduct TDS wherever required under applicable laws.
              </li>
              <li>
                <strong>Non-MLM/Pyramid Marketing Declaration:</strong> The PIC Program is a customer referral and community awareness initiative. Income is linked to genuine product purchases. No income is paid for recruitment alone. The program is not intended to operate as a pyramid scheme.
              </li>
            </ol>

            <div className="bg-brand-sage/10 p-6 rounded-xl mt-8 border border-brand-sage/30">
              <h4 className="text-lg font-bold text-brand-forest mb-4">PIC Declaration</h4>
              <p className="italic font-medium">
                "I understand that I am joining U-Turn4Nature as an Independent Partner in Change (PIC). I am not an employee, agent, or distributor of the company. I will promote the values of homemade products, ethical business practices, and rural women empowerment while complying with all applicable laws and program guidelines."
              </p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-xl mt-6 border border-red-200">
              <h4 className="text-lg font-bold text-red-700 mb-4">CONFIDENTIALITY & NON-DISCLOSURE</h4>
              <p className="text-sm text-red-600">
                This document is intended solely for the individual or entity to whom it has been directly issued by U-Turn4Nature. It contains confidential, proprietary, commercial, strategic, and business-sensitive information. By accessing this document, the recipient agrees that they shall not copy, reproduce, publish, distribute, circulate, or disclose this document to any third party without obtaining prior written permission from U-Turn4Nature.
              </p>
            </div>
            
            {/* Empty space to ensure scroll is long enough */}
            <div className="h-8"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 italic">
            {!hasScrolledToBottom ? "Please scroll to the bottom to accept." : "Thank you for reading the policy."}
          </p>
          <button
            onClick={handleAccept}
            disabled={isLoading || !hasScrolledToBottom}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-md
              ${hasScrolledToBottom 
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
