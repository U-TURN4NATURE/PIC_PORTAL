import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Users, Heart, TrendingUp,
  ShieldCheck, Star, MapPin, Leaf, Award, Gift,
  ChevronLeft, ChevronRight, Phone, Mail,
  ArrowUpCircle
} from 'lucide-react';

import Navbar from '@/components/home/Navbar';
import FadeSection from '@/components/home/FadeSection';
import FAQSection from '@/components/home/FAQSection';
import SuccessStories from '@/components/home/SuccessStories';
import { FloatingButtons, MobileStickyBar } from '@/components/home/FloatingButtons';
import { G, G2, GOLD, PINK, CREAM, CHARCOAL, WA } from '@/components/home/constants';
import AIChatWidget from '@/components/AIChat/AIChatWidget';

// ──────────────────────────────────────────────────────────────
// Brand tokens (also available via CSS vars in globals.css)
// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '100+', label: 'PICs and Mentors', icon: Users },
  { value: '50,000+', label: 'Happy Customers', icon: Heart },
  { value: '60,000+', label: 'Women Empowered', icon: Award },
  { value: '₹35,000', label: 'Avg. Monthly Earning', icon: TrendingUp },
];

const HOW_STEPS = [
  { step: '01', icon: ShieldCheck, title: 'Register Free', desc: 'Sign up in 2 minutes. No fees, no investment, no inventory required.' },
  { step: '02', icon: Heart, title: '1-2-1', desc: 'Brief discussion, offer letter, Orientation on Products USP and how to proceed — Offline/Online.' },
  { step: '03', icon: Gift, title: 'Share Awareness', desc: 'Share your referral link/website. Your contacts discover & buy authentic homemade products online.' },
  { step: '04', icon: TrendingUp, title: 'Earn Monthly', desc: 'Get 5%+ on every purchase made by your referral — lifelong.' },
  { step: '05', icon: Award, title: 'Rewards & Benefits', desc: 'Vacation with RWEs, company share opportunity, extra bonus, discounts. Connect with our Networks.' },
  { step: '06', icon: Star, title: 'Build Your Business', desc: 'We support PIC women to start their own business with complete handholding — Impact #100MillionWomen.' },
];

const INCOME_TIERS = [
  {
    name: 'Starter Partner',
    customers: '100',
    monthly: '₹12,000',
    icon: Leaf,
    color: `from-emerald-500 to-green-600`,
    badge: 'Begin Your Journey',
    features: [],
  },
  {
    name: 'Growth Partner',
    customers: '500',
    monthly: '₹60,000',
    icon: TrendingUp,
    color: `from-[#1B4332] to-[#2d6a4f]`,
    badge: 'Growth Partner',
    features: [],
    highlight: true,
  },
  {
    name: 'Leader Partner',
    customers: '1,000',
    monthly: '₹1,20,000',
    icon: Award,
    color: 'from-yellow-500 to-amber-600',
    badge: 'Top Performer',
    features: [],
  },
];

// SUCCESS_STORIES moved to SuccessStories.tsx

const TRUST_BADGES = [
  { icon: '🔒', label: 'Secure Payments' },
  { icon: '✅', label: 'Verified Products' },
  { icon: '👩‍🌾', label: 'Women-Led Movement' },
  { icon: '🌿', label: '100% Homemade' },
  { icon: '📦', label: 'Direct from Villages' },
];

const PRODUCTS = [
  { name: 'Homemade Chakki Atta', img: 'https://img.clevup.in/378284/homemadempchakkiattanaturalorganic-1780159278020.png?width=600&format=webp', desc: 'Stone-ground · Village SHG', link: 'https://www.u-turn.in/products/mp-chakki-wheat-attahomemade-with-fiber-5kg' },
  { name: 'Wood-Cold-Pressed Oils', img: 'https://img.clevup.in/378284/ColdPressedBlack-1720010819686-1773488089243.jpeg?width=600&format=webp', desc: 'Kachi Ghani · Unrefined', link: 'https://www.u-turn.in/categories/wood-cold-pressed-oil' },
  { name: 'Bilona Ghee', img: 'https://img.clevup.in/378284/Ghee-1773482703603.png?width=600&format=webp', desc: 'Pure A2 Cow · Desi Method', link: 'https://www.u-turn.in/products/gir-cow-bilona-ghee-1lx5' },
  { name: 'Homemade Pickle', img: 'https://img.clevup.in/378284/PICKLEIGRED-1763141259774.png?width=600&format=webp', desc: 'Traditional · No preservatives', link: 'https://www.u-turn.in/categories/pickles-papad-etc' },
  { name: 'Natural Jaggery', img: 'https://img.clevup.in/378284/JaggerycubesBack-1720026344172-1774074073818.png?width=600&format=webp', desc: 'No chemicals · No sugar', link: 'https://www.u-turn.in/categories/jaggery-gur-khand' },
  { name: 'Homemade Snacks', img: 'https://img.clevup.in/378284/RagiChipsPeriPeriFront-1772884317651.png?width=600&format=webp', desc: 'Roasted · Village-made', link: 'https://www.u-turn.in/categories/home-made-snacks' },
  { name: 'State Specific Products', img: '', desc: 'Regional specialities · Authentic', link: 'https://www.u-turn.in' },
  { name: 'Many More Products', img: '', desc: 'Growing catalogue · New arrivals', link: 'https://www.u-turn.in' },
];

const PRODUCT_GRADIENTS = [
  'linear-gradient(135deg,#1B4332,#2d6a4f)',
  'linear-gradient(135deg,#b5451b,#d4630a)',
  'linear-gradient(135deg,#D4A017,#b8941e)',
  'linear-gradient(135deg,#1B4332,#2d6a4f)',
  'linear-gradient(135deg,#7b2d8b,#9c4db8)',
  'linear-gradient(135deg,#b5451b,#d4630a)',
  'linear-gradient(135deg,#0f7ea8,#1b9fd4)',
  'linear-gradient(135deg,#E91E8C,#c4157a)',
];

// FAQ moved to FAQSection.tsx

// Components extracted to src/components/home/

const WA_SVG = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WA_HREF = "https://wa.me/917703944883?text=Hi%2C%20I%20want%20to%20become%20a%20Partner%20in%20Change%20with%20U-Turn4Nature";

// ──────────────────────────────────────────────────────────────
// TICKER / MARQUEE
// ──────────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    '🌿 100% Homemade',
    '✅ Women-Led Production',
    '💰 No Investment Required',
    '📅 Monthly Earnings',
  ];
  return (
    <div className="overflow-hidden py-0 mt-[75px]" style={{ background: `linear-gradient(90deg, ${G} 0%, ${PINK} 50%, ${G} 100%)` }}>
      <div className="inline-flex gap-16 animate-marquee py-3 whitespace-nowrap">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: CREAM }}>
      {/* Full-width dark gradient over collage */}
      <div className="absolute inset-0 z-0">
        <Image src="/ghar_ka_khana.jpeg" alt="Ghar ka bana hi khana - U-Turn4Nature homemade products" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(13,40,24,0.92) 0%, rgba(27,67,50,0.85) 50%, rgba(13,40,24,0.7) 100%)'
        }} />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 4s linear infinite' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-28 text-center text-white">
        <FadeSection>
          {/* Policy badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
            style={{ background: `${PINK}22`, border: `1px solid ${PINK}60`, backdropFilter: 'blur(8px)' }}>
            <Leaf className="w-4 h-4" style={{ color: PINK }} />
            <span style={{ color: '#FFB3D9' }}>India's Homemade Revolution · #100MillionWomen</span>
          </div>

          {/* PIC Policy Tagline — do not change */}
          <h1 className="font-bold leading-tight mb-3" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-white mb-1">A Lifetime Business</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-white mb-4">Opportunity</span>
            <span className="block text-base sm:text-lg font-semibold mb-2" style={{ color: G2 }}>Become</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-extrabold" style={{ color: PINK }}>
              &ldquo;Partner in Change&rdquo;
            </span>
          </h1>

          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-6 mt-4">
            This program gives individuals a chance to{' '}
            <strong style={{ color: PINK }}>earn lifelong income</strong> and become{' '}
            <strong style={{ color: G2 }}>co-architects of women empowerment.</strong>
          </p>

          <p className="text-2xl sm:text-3xl font-extrabold mb-10" style={{ color: GOLD, textShadow: `0 4px 20px ${GOLD}40` }}>
            No Investment
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 text-white font-bold text-base rounded-full transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${PINK}, #c4157a)`, boxShadow: `0 8px 28px ${PINK}55` }}>
              Join Now — Register Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base rounded-full transition-all hover:-translate-y-0.5"
              style={{ border: `2px solid ${G2}80`, color: G2 }}>
              See How It Works ↓
            </a>
          </div>


        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// STATS BAR
// ──────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <FadeSection>
      <section className="py-12" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map(({ value, label, icon: Icon }, idx) => (
            <div key={label} className="group bg-white rounded-2xl p-6 text-center border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: `${G}15` }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 group-hover:scale-110 transition-transform"
                style={{ background: idx % 2 === 0 ? `${G}15` : `${GOLD}20` }}>
                <Icon className="w-6 h-6" style={{ color: idx % 2 === 0 ? G : GOLD }} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: CHARCOAL, fontFamily: "var(--font-plus-jakarta), sans-serif" }}>{value}</p>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </FadeSection>
  );
}

// ──────────────────────────────────────────────────────────────
// HOW IT WORKS — Visual timeline
// ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: 'white' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>Your Journey to Success</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">From registration to monthly income — it's simpler than you think.</p>
        </FadeSection>

        {/* Desktop timeline — 3-col x 2-row grid for 6 steps */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 relative">
          {HOW_STEPS.map(({ step, icon: Icon, title, desc }, i) => (
            <FadeSection key={step} delay={i * 120}>
              <div className="flex flex-col items-center text-center px-4 group">
                {/* Circle number badge */}
                <div className="relative w-[104px] h-[104px] flex items-center justify-center mb-6 z-10">
                  <div className="absolute inset-0 rounded-full opacity-20 scale-110 group-hover:scale-125 transition-transform duration-300"
                    style={{ background: G }} />
                  <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)`, boxShadow: `0 8px 24px ${G}40` }}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: GOLD }}>
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden relative pl-10">
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{ backgroundImage: `repeating-linear-gradient(180deg, ${G}40 0, ${G}40 8px, transparent 8px, transparent 16px)` }} />
          {HOW_STEPS.map(({ step, icon: Icon, title, desc }, i) => (
            <FadeSection key={step} delay={i * 120}>
              <div className="relative mb-10 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-10 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>
                  {step}
                </div>
                <div className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                  style={{ borderColor: `${G}20` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" style={{ color: G }} />
                    <h3 className="font-bold text-gray-900">{title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// EARNINGS / PRICING
// ──────────────────────────────────────────────────────────────

function IncomeSection() {
  return (
    <section id="income" className="py-24" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #b8941e)` }}>Earning Potential</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>Your Income, Your Choice</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">The more awareness you spread, the more you earn — every month, for life.</p>
        </FadeSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {INCOME_TIERS.map(({ name, customers, monthly, icon: Icon, color, highlight }, i) => (
            <FadeSection key={name} delay={i * 130}>
              <div className={`relative h-full flex flex-col transition-all duration-300 ${highlight ? 'scale-105 z-10' : 'hover:-translate-y-1'}`}
                style={{ paddingTop: highlight ? '0' : '0' }}>

                <div className={`rounded-3xl overflow-hidden flex-1 flex flex-col ${highlight
                  ? 'shadow-2xl ring-2 ring-[#1B4332]'
                  : 'border border-gray-100 shadow-lg hover:shadow-2xl'
                  }`}>
                  <div className={`bg-gradient-to-br ${color} p-10 text-white relative flex-1 flex flex-col justify-center`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5 relative z-10">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 relative z-10">{name}</h3>
                    <p className="text-white/70 text-sm mb-5 flex items-center gap-1.5 relative z-10">
                      <Users className="w-3.5 h-3.5" />{customers} Active Customers
                    </p>
                    <div className="flex items-end gap-1 relative z-10">
                      <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>{monthly}</span>
                      <span className="text-white/60 text-sm mb-1">/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <FadeSection>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={WA_HREF} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${WA}, #128C7E)`, boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}>
              {WA_SVG} Chat with us on WhatsApp
            </a>
            <p className="text-gray-400 text-sm">* Estimated earning based on approx 5% of total purchase. Actual earning depends on awareness and purchase.</p>
          </div>
        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// PRODUCTS SECTION
// ──────────────────────────────────────────────────────────────

function ProductShowcase() {
  return (
    <section id="products" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white"
            style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>What You'll Promote</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>
            Authentic Products People Love
          </h2>
          {/* 97% trust badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-6"
            style={{ background: `${GOLD}15`, color: '#8a6000', border: `1px solid ${GOLD}40` }}>
            ⭐ 97% repeat purchase rate — customers come back every month
          </div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Every product is made by rural women in their homes or village SHG kitchens — pure, natural, and loved by families across India.
          </p>
        </FadeSection>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {PRODUCTS.map(({ name, img, desc, link }, idx) => (
            <FadeSection key={name} delay={idx * 80}>
              <a href={link} target="_blank" rel="noreferrer"
                className="group bg-white rounded-2xl p-5 border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex items-center gap-4 cursor-pointer"
                style={{ borderColor: `${G}12` }}>
                <div className="w-[80px] h-[80px] rounded-2xl flex-shrink-0 overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{ background: img ? '#f8f8f8' : PRODUCT_GRADIENTS[idx] }}>
                  {img ? (
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {idx === 6 ? '🗺️' : '✨'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base mb-0.5 group-hover:text-[#1B4332] transition-colors">{name}</p>
                  <p className="text-sm text-gray-400">{desc}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: G }}>Shop Now →</p>
                </div>
              </a>
            </FadeSection>
          ))}
        </div>

        {/* Our Promise — full-width image, no distortion */}
        <FadeSection>
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/our_promise.jpeg"
                alt="Our Promise - U-Turn4Nature"
                width={1200}
                height={630}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// SUCCESS STORIES — auto-scroll carousel
// ──────────────────────────────────────────────────────────────

// SuccessStories moved to component

// ──────────────────────────────────────────────────────────────
// TRUST BADGES
// ──────────────────────────────────────────────────────────────

function TrustSection() {
  return (
    <FadeSection>
      <section className="py-14 relative overflow-hidden" style={{ background: G }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
          <p className="text-center text-white/60 text-xs font-bold uppercase tracking-widest mb-8">Certified · Verified · Trusted by Thousands</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label}
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 text-white backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-default"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

// FAQSection moved to component

// ──────────────────────────────────────────────────────────────
// FINAL CTA
// ──────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <FadeSection>
      <section className="py-0" style={{ background: G }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-block px-5 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background: `${PINK}22`, border: `1px solid ${PINK}50` }}>
              <span style={{ color: '#FFB3D9' }}>💗 A Lifetime Business Opportunity</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>
              Join Now as a
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold mb-8" style={{ color: PINK, textShadow: '0 2px 20px rgba(233,30,140,0.4)' }}>
              &ldquo;Partner in Change&rdquo;
            </p>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
              100+ PICs earning lifelong income while becoming co-architects of women empowerment across India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/register"
                className="group flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-full transition-all hover:-translate-y-1 hover:shadow-xl text-white"
                style={{ background: `linear-gradient(135deg, ${PINK}, #c4157a)`, boxShadow: `0 8px 28px ${PINK}55` }}>
                Register Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 font-semibold text-lg rounded-full transition-all hover:-translate-y-0.5"
                style={{ border: `2px solid ${CREAM}60`, color: CREAM }}>
                Already a PIC? Login
              </Link>
            </div>
            <p className="text-white/50 text-sm">No investment · No inventory · Earn forever</p>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

// ──────────────────────────────────────────────────────────────
// FOOTER
// ──────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: '#0D2818', color: '#9ca3af' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl py-3 px-4 inline-flex items-center gap-3 mb-5 shadow-md">
            <img src="https://img.clevup.in/378284/LOGOUT2AUG25-1754702859985.jpeg?height=200&format=webp" alt="U-Turn4Nature logo" className="object-contain h-12 w-auto" loading="lazy" />
            <div className="border-l-2 pl-3 py-0.5" style={{ borderColor: `${GOLD}40` }}>
              <span className="block text-2xl font-bold leading-[1.1] tracking-tight" style={{ color: G }}>
                U-Turn
              </span>
              <span className="block text-2xl font-bold leading-[1.1] tracking-tight mb-1">
                <span style={{ color: PINK }}>4</span> <span style={{ color: G }}>Nature</span>
              </span>
              <span className="block text-xs font-semibold leading-none tracking-wide" style={{ color: PINK }}>
                Homemade Goodness
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 mb-4">India's first exclusive pure homemade grocery brand. Creating dignified livelihoods for rural women.</p>
          <p className="text-xs font-semibold">
            <span style={{ color: GOLD }}>#100MillionWomen </span>
            <span style={{ color: PINK }}>#PartnerInChange</span>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul className="space-y-3">
            {[['How It Works', '#how-it-works'], ['Earnings', '#income'], ['Success Stories', '#stories'], ['Products', '#products'], ['FAQ', '#faq']].map(([label, href]) => (
              <li key={label}>
                <a href={href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#2ECC71] transition-colors" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* PIC Portal */}
        <div>
          <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">PIC Portal</h4>
          <ul className="space-y-3">
            {[['Register Free', '/register'], ['Partner Login', '/login'], ['Policy Document', '/policy.pdf']].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#2ECC71] transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Get In Touch</h4>
          <div className="space-y-3 mb-6">
            <a href="tel:7703944883" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Phone className="w-4 h-4" style={{ color: GOLD }} /> 7703944883
            </a>
            <a href="mailto:support@u-turn.in" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Mail className="w-4 h-4" style={{ color: GOLD }} /> support@u-turn.in
            </a>
          </div>
          <div className="flex gap-3">
            {/* Instagram */}
            <a href="https://www.instagram.com/uturn4nature/" target="_blank" rel="noreferrer" aria-label="Instagram"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#E1306C]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" color="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@u-turn4nature" target="_blank" rel="noreferrer" aria-label="YouTube"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#FF0000]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" color="white">
                <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/UTurn4Nature" target="_blank" rel="noreferrer" aria-label="Facebook"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#1877F2]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" color="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a href={WA_HREF} target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:bg-[#25D366]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" color="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-4 py-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© 2026 U-TURN4NATURE LLP. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500">GSTIN: 09AAFFU8734N2ZC</span>
            <span>Plot No. 4, Ecotech 3, Greater Noida – 201306</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────
// FLOATING WHATSAPP + BACK TO TOP
// ──────────────────────────────────────────────────────────────

// Floating components moved to FloatingButtons.tsx

// ──────────────────────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <Navbar />
      <Ticker />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <IncomeSection />
      <ProductShowcase />
      <SuccessStories />
      <TrustSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <FloatingButtons />
      <MobileStickyBar />
      <AIChatWidget />
    </div>
  );
}
