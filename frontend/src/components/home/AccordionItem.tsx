"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PINK } from './constants';

export default function AccordionItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-start justify-between gap-4 focus:outline-none">
        <span className="font-bold text-gray-900 pr-4">{q}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PINK }} />
        ) : (
          <ChevronDown className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" />
        )}
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}
