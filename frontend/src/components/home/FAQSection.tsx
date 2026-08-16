"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { G } from './constants';
import FadeSection from './FadeSection';

const FAQ = [
  {
    q: 'Is this an MLM or pyramid scheme?',
    a: 'No. This is a pure referral program. You earn 3% to 5% plus other benfits on your referred customers\' purchases — not by recruiting others. There is zero "joining fee chain" and no obligation to recruit anyone. No investment required.',
  },
  {
    q: 'What about the 3%–5% referral and other benefits ?',
    a: 'The first 500 Active PICs will earn 5%, the next 500 Active PICs 4%, and all subsequent Active PICs 3% on purchases made by their directly referred customers. To qualify as an Active PIC, your referred customers must generate a minimum total purchase of ₹9,999 within 6 months of joining. Join early to secure a higher referral benefit. Additional benefits may include exclusive discounts, family village holidays with Didi, PIC Club membership, PIC own venture support, potential equity opportunities, subject to applicable terms etc. There is no joining fee, investment, compulsory purchase or recruitment requirement.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'paid directly to your bank account or UPI ID by the 10th of every month for the previous month\'s verified sales.',
  },
  {
    q: 'Can I join from any state in India?',
    a: 'Currently PIC program is only for Delhi NCR region.',
  },
  {
    q: 'Do I need to stock or deliver products?',
    a: 'Absolutely not. No inventory, no stocking, no delivery. Customers order directly from our website using your referral link. We handle everything else.',
  },
  {
    q: 'Is there any joining fee?',
    a: 'Completely free. Registration is 100% free — always was, always will be. We only succeed when you succeed.',
  },
  {
    q: 'What is U-Turn4Nature?',
    a: 'U-Turn4Nature is India\'s first exclusive homemade grocery brand, created by rural women entrepreneurs, SHGs, FPOs, and cooperatives. Our mission is to provide authentic homemade food/groceries while creating sustainable livelihoods for rural women.',
  },
  {
    q: 'What is the Partners in Change (PIC) Program?',
    a: 'PIC Women are Co-Partners and Ambassadors who promote the values of homemade food and rural women empowerment by connecting families and communities with authentic products while mentoring rural entrepreneurs and their family members. PICs are not sales agents.',
  },
  {
    q: 'Who can join the PIC Program?',
    a: 'Anyone who believes in supporting rural women entrepreneurs, promoting healthier homemade food, and creating social impact can join the program.',
  },
  {
    q: 'Is there any joining fee?',
    a: 'No. There is no joining fee or other fee to become a Partner in Change.',
  },
  {
    q: 'Do PICs need to maintain inventory?',
    a: 'No. PICs do not need to purchase, stock, or manage any inventory.',
  },
  {
    q: 'Do PICs handle product delivery?',
    a: 'No. U-Turn4Nature manages all product packaging, dispatch, and delivery. PICs only help create awareness and connect customers.',
  },
  {
    q: 'How do PICs earn?',
    a: 'PICs receive an awareness-sharing contribution on purchases made by customers referred by them. Earnings continue as long as the referred customers remain active.',
  },
  {
    q: 'Is there a limit to the number of customers I can refer?',
    a: 'No. There is no limit on referrals.',
  },
  {
    q: 'How are payouts made?',
    a: 'PICs receive transparent monthly statements. Earnings can be withdrawn or redeemed as product credits.',
  },
  {
    q: 'What products does U-Turn4Nature offer?',
    a: 'We offer a growing range of authentic homemade products including atta, cold-pressed oils, spices, snacks, pickles, traditional foods, millet-based products, and regional specialties.',
  },
  {
    q: 'Are U-Turn4Nature products healthy?',
    a: 'Yes. Our products focus on traditional homemade methods and generally avoid refined maida, refined sugar, palm oil, hydrogenated fats (vanaspati), and unnecessary artificial additives. Our products are simply homemade by thousands of village women. Quality assured by U-Turn4Nature.',
  },
  {
    q: 'What makes U-Turn4Nature different from other brands?',
    a: 'U-Turn4Nature is India’s first exclusive pure homemade grocery brand, created by thousands of rural women from SHGs, FPOs, and Cooperatives in their own villages. Unlike factory-made products, our products are prepared using traditional homemade methods by trained women entrepreneurs, just as they would be made in your own homes. We believe truly homemade products are often better than many so-called organic products in the market because they are made with care, traditional knowledge, and minimal processing. By organizing thousands of women producers across India, U-Turn4Nature makes authentic homemade groceries available to millions of consumers while creating sustainable livelihoods for rural women. Every purchase supports women-led enterprises and brings the taste, trust, and goodness of real homemade food to your family.',
  },
  {
    q: 'Can I visit the women entrepreneurs who make the products?',
    a: 'Yes. PICs may voluntarily participate in rural immersion visits to interact with women entrepreneurs and understand their journey.',
  },
  {
    q: 'What are PIC Club Membership Levels?',
    a: 'PIC Club has three categories: Silver Member, Gold Member, and Diamond Member. Membership level depends on active customer participation and contribution.',
  },
  {
    q: 'What benefits do PIC Club members receive?',
    a: 'Benefits may include training programs, networking opportunities, recognition certificates, leadership development, business exposure visits, travel opportunities, and other special rewards.',
  },
  {
    q: 'Can PICs build their own homemade food business?',
    a: 'Yes. U-Turn4Nature actively encourages eligible PIC women to establish and grow their own homemade food enterprises. Support may include mentoring, branding, packaging guidance, market access, and business development assistance.',
  },
  {
    q: 'Does U-Turn4Nature provide a product guarantee?',
    a: 'Yes. We offer Return, Replacement, and Refund support for genuine customer concerns, reflecting our confidence in product quality.',
  },
  {
    q: 'Can PIC membership be transferred?',
    a: 'Yes. Under certain circumstances, PIC membership may be transferred to a family member, preferably a female family member.',
  },
  {
    q: 'Will my earnings stop if I discontinue active participation?',
    a: 'Existing customer-linked earnings may continue as per prevailing PIC policies, even if active engagement reduces.',
  },
  {
    q: 'How does my participation create social impact?',
    a: 'Every customer connected through the PIC Program helps create income opportunities for rural women, strengthens local enterprises, and supports the vision of empowering 100 million women across India.',
  },
  {
    q: 'How can I become a Partner in Change?',
    a: 'Simply register through the U-Turn4Nature PIC website or contact our team. We will guide you through the onboarding process and provide all necessary training and support.',
  },
  {
    q: 'How can I contact U-Turn4Nature?',
    a: 'You can reach us through our website, WhatsApp support, email, or social media channels for any assistance regarding products, orders, or the PIC Program.',
  },
  {
    q: 'What methods do you use to recommend products to others?',
    a: 'Full orientation and training will be provided regularly.',
  },
  {
    q: 'How will I learn about the products and their Unique features (USP & UVP)?',
    a: 'We will provide you with product information, training materials, and promotional creatives to help you understand the products, their benefits, and their USP (Unique Selling Proposition) and UVP (Unique Value Proposition).',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>Got Questions?</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>Frequently Asked</h2>
          <p className="text-gray-500 text-lg">Everything you need to know before you begin.</p>
        </FadeSection>

        <FadeSection>
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-1 pr-3" 
               style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden transition-all duration-200"
                style={{ borderColor: open === i ? `${G}40` : '#e5e7eb', boxShadow: open === i ? `0 4px 20px ${G}12` : 'none' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  aria-expanded={open === i}>
                  <span className="font-bold text-gray-900 text-base leading-snug">{q}</span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: open === i ? G : `${G}12` }}>
                    {open === i
                      ? <ChevronUp className="w-4 h-4 text-white" />
                      : <ChevronDown className="w-4 h-4" style={{ color: G }} />}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-[600px]' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeSection>
      </div>
    </section>
  );
}
