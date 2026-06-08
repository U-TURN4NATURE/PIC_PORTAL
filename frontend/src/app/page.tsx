"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Play, CheckCircle2, Users, Heart, TrendingUp,
  ShieldCheck, Star, MapPin, Leaf, Award, Zap, Gift,
  ChevronLeft, ChevronRight, Phone, Mail, Share2, Video, MessageCircle
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '10,000+', label: 'Active Partners', icon: Users },
  { value: '2,50,000+', label: 'Happy Customers', icon: Heart },
  { value: '500+', label: 'Women SHGs', icon: Award },
  { value: 'Pan India', label: 'Presence', icon: MapPin },
];

const HOW_STEPS = [
  { step: '01', icon: ShieldCheck, title: 'Register Free', desc: 'Sign up in 2 minutes. No fees, no investment, no inventory.' },
  { step: '02', icon: Heart, title: 'Share Awareness', desc: 'Share your unique link with friends, family & community.' },
  { step: '03', icon: Gift, title: 'Customers Purchase', desc: 'Your contacts discover & buy authentic homemade products.' },
  { step: '04', icon: TrendingUp, title: 'Earn Monthly', desc: 'Get 5% on every purchase made by your contacts – for life.' },
];

const INCOME_TIERS = [
  {
    name: 'Starter Partner',
    customers: '100',
    monthly: '₹12,000',
    icon: Leaf,
    color: 'from-emerald-500 to-green-600',
    badge: 'Begin Your Journey',
    features: ['Personal referral link', 'Monthly payouts', 'PIC dashboard', 'Dedicated support'],
  },
  {
    name: 'Growth Partner',
    customers: '500',
    monthly: '₹60,000',
    icon: TrendingUp,
    color: 'from-brand-forest to-brand-olive',
    badge: 'Most Popular',
    features: ['Everything in Starter', 'Priority support', 'Performance bonuses', 'SHG mentoring access'],
    highlight: true,
  },
  {
    name: 'Leader Partner',
    customers: '1,000',
    monthly: '₹1,20,000',
    icon: Award,
    color: 'from-yellow-500 to-amber-600',
    badge: 'Top Performer',
    features: ['Everything in Growth', 'Community leader badge', 'Special recognition', 'Exclusive events'],
  },
];

const SUCCESS_STORIES = [
  {
    name: 'Rekha Devi',
    location: 'Lucknow, UP',
    income: '₹18,000/mo',
    img: '/women_1.png',
    quote: 'I started as a homemaker and now I support my family with my own earnings. U-Turn4Nature changed my life.',
  },
  {
    name: 'Savita Kumari',
    location: 'Nashik, Maharashtra',
    income: '₹42,000/mo',
    img: '/women_2.png',
    quote: 'Being a PIC means I promote the food I believe in. My community trusts me and that makes all the difference.',
  },
  {
    name: 'Priya Sharma',
    location: 'Jaipur, Rajasthan',
    income: '₹65,000/mo',
    img: '/women_3.png',
    quote: 'Within 8 months I had 600 active customers. The products sell themselves – homemade quality speaks for itself.',
  },
];

const TRUST_BADGES = [
  { icon: '🏛️', label: 'FSSAI Certified' },
  { icon: '🔒', label: 'Secure Payments' },
  { icon: '✅', label: 'Verified Products' },
  { icon: '👩‍🌾', label: 'Women-Led Movement' },
  { icon: '🌿', label: '100% Homemade' },
  { icon: '📦', label: 'Direct from Villages' },
];

const PRODUCTS = [
  { name: 'Homemade Atta', emoji: '🌾', desc: 'Stone-ground whole wheat' },
  { name: 'Cold-Pressed Oils', emoji: '🫙', desc: 'Kachi Ghani, unrefined' },
  { name: 'Village Ghee', emoji: '🧈', desc: 'Pure desi A2 cow ghee' },
  { name: 'Sun-dried Pickles', emoji: '🥒', desc: 'Traditional recipes' },
  { name: 'Organic Jaggery', emoji: '🍯', desc: 'No chemicals, no sugar' },
  { name: 'Artisan Snacks', emoji: '🥜', desc: 'Roasted, no preservatives' },
];

// ──────────────────────────────────────────────────────────────
// Scroll-in animation hook
// ──────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ──────────────────────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────────────────────

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Ticker / Marquee
// ──────────────────────────────────────────────────────────────

function Ticker() {
  const items = ['🌿 100% Homemade', '✅ Women-Led Production', '💰 No Investment Required', '📅 Monthly Earnings', '🏛️ FSSAI Certified', '🚀 10,000+ Active PICs', '🌾 500+ SHGs Empowered'];
  return (
    <div className="bg-brand-forest text-white py-2.5 overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-12 animate-marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-sm font-medium tracking-wide">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Navbar
// ──────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/70 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* Compact circular badge logo — perfect for navbar */}
          <div className="bg-white rounded-full p-1 shadow-md border border-gray-100 flex-shrink-0">
            <Image src="/logo_1.jpg" alt="U-Turn4Nature" width={52} height={52} className="object-contain w-12 h-12 rounded-full" />
          </div>
          <div>
            <span className="block text-sm font-bold text-brand-forest leading-tight">U-Turn4Nature</span>
            <span className="block text-[10px] text-pink-500 font-semibold leading-tight tracking-wide">Homemade Goodness</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#how-it-works" className="hover:text-brand-forest transition-colors">How It Works</a>
          <a href="#income" className="hover:text-brand-forest transition-colors">Earnings</a>
          <a href="#stories" className="hover:text-brand-forest transition-colors">Success Stories</a>
          <a href="#products" className="hover:text-brand-forest transition-colors">Products</a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block px-4 py-2 text-brand-forest font-semibold text-sm hover:bg-brand-forest/5 rounded-lg transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2.5 bg-brand-forest text-white font-semibold text-sm rounded-xl hover:bg-brand-forest/90 transition-all shadow-md shadow-brand-forest/20 hover:shadow-lg hover:shadow-brand-forest/30 hover:-translate-y-0.5 flex items-center gap-2">
            Register Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ──────────────────────────────────────────────────────────────
// Hero
// ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-[#F8F6F0] overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-forest/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-sage/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">

        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-brand-forest/10 border border-brand-forest/20 rounded-full px-4 py-1.5 mb-6">
            <Leaf className="w-4 h-4 text-brand-forest" />
            <span className="text-brand-forest text-sm font-semibold">India's Homemade Revolution · #100MillionWomen</span>
          </div>

          <h1 className="font-dm-serif text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-5">
            Earn Monthly While{' '}
            <span className="text-brand-forest relative">
              Promoting
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" preserveAspectRatio="none" fill="none">
                <path d="M0 6 Q75 2 150 6 Q225 10 300 6" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>{' '}
            Healthy Homemade Food
          </h1>

          <p className="text-gray-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
            Join India's Homemade Revolution and Support Rural Women Entrepreneurs. Become a{' '}
            <strong className="text-brand-forest">Partner in Change</strong> — not a sales agent, but a community leader and food ambassador.
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2.5 mb-8 max-w-md">
            {['✔ 100% Homemade', '✔ Women-led Production', '✔ No Investment Required', '✔ Monthly Earnings'].map((b) => (
              <div key={b} className="flex items-center gap-2 bg-white border border-brand-sage/40 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
                {b}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-brand-forest text-white font-bold text-base rounded-2xl shadow-xl shadow-brand-forest/30 hover:bg-brand-forest/90 hover:shadow-brand-forest/40 hover:-translate-y-1 transition-all duration-200">
              Register Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-brand-sage/50 text-brand-forest font-semibold text-base rounded-2xl hover:border-brand-forest/40 hover:bg-brand-forest/5 transition-all duration-200">
              <span className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-white fill-white" />
              </span>
              Watch How It Works
            </button>
          </div>

          <p className="mt-5 text-xs text-gray-400">Free to join · No credit card · No inventory · Earn forever</p>
        </div>

        {/* Right – product collage */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-lg mx-auto">
            {/* Main image */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/product_collage.png"
                alt="U-Turn4Nature Homemade Products"
                width={580}
                height={480}
                className="object-cover w-full h-[420px] sm:h-[480px]"
                priority
              />
            </div>

            {/* Floating card – earnings */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 min-w-[160px]">
              <p className="text-xs text-gray-500 mb-1">Avg. Monthly Earning</p>
              <p className="text-2xl font-dm-serif font-bold text-brand-forest">₹35,000</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-semibold">+18% this month</span>
              </div>
            </div>

            {/* Floating card – partners */}
            <div className="absolute -top-6 -right-6 bg-brand-forest text-white rounded-2xl shadow-2xl p-4 min-w-[140px]">
              <p className="text-xs text-brand-sage mb-1">Active Partners</p>
              <p className="text-2xl font-dm-serif font-bold">10,000+</p>
              <div className="flex -space-x-1 mt-2">
                {['🟢', '🟢', '🟢', '🟢'].map((d, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-brand-sage/40 border-2 border-brand-forest flex items-center justify-center text-[10px]">{d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Stats Bar
// ──────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <FadeSection>
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-forest/8 mb-3 group-hover:bg-brand-forest/15 transition-colors">
                <Icon className="w-6 h-6 text-brand-forest" />
              </div>
              <p className="text-3xl font-dm-serif font-bold text-brand-forest">{value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </FadeSection>
  );
}

// ──────────────────────────────────────────────────────────────
// How It Works
// ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#F8F6F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-14">
          <span className="inline-block bg-brand-forest/10 text-brand-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Simple 4-Step Process</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">From registration to monthly income — it's simpler than you think.</p>
        </FadeSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map(({ step, icon: Icon, title, desc }, i) => (
            <FadeSection key={step} delay={i * 120}>
              <div className="group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center h-full">
                {/* Connector line */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-dashed border-t-2 border-dashed border-brand-sage z-10" />
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-forest to-brand-olive text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand-forest/20">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="absolute top-5 right-5 text-5xl font-dm-serif font-bold text-gray-100 select-none">{step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Income Cards
// ──────────────────────────────────────────────────────────────

function IncomeSection() {
  return (
    <section id="income" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-14">
          <span className="inline-block bg-brand-gold/15 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Earning Potential</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">Your Income, Your Choice</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">The more awareness you spread, the more you earn — every month, for life.</p>
        </FadeSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {INCOME_TIERS.map(({ name, customers, monthly, icon: Icon, color, badge, features, highlight }, i) => (
            <FadeSection key={name} delay={i * 120}>
              <div className={`relative rounded-3xl overflow-hidden h-full flex flex-col ${highlight ? 'ring-2 ring-brand-forest shadow-2xl shadow-brand-forest/20 scale-105' : 'border border-gray-200 shadow-lg'}`}>
                {/* Card header */}
                <div className={`bg-gradient-to-br ${color} p-8 text-white`}>
                  {highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      ⭐ {badge}
                    </div>
                  )}
                  {!highlight && (
                    <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{badge}</div>
                  )}
                  <Icon className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-1">{name}</h3>
                  <p className="text-white/70 text-sm mb-5">{customers} Customers</p>
                  <div>
                    <span className="text-4xl font-dm-serif font-bold">{monthly}</span>
                    <span className="text-white/60 text-sm ml-1">/month</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="bg-white flex-1 p-6 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-brand-forest flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`block text-center py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${highlight ? 'bg-brand-forest text-white shadow-lg shadow-brand-forest/25 hover:shadow-brand-forest/40' : 'border-2 border-brand-forest text-brand-forest hover:bg-brand-forest/5'}`}>
                    Start as {name}
                  </Link>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        <FadeSection>
          <p className="text-center text-gray-400 text-sm mt-8">* Income estimates based on 5% contribution rate. Actual earnings depend on customer purchase frequency.</p>
        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Product Showcase
// ──────────────────────────────────────────────────────────────

function ProductShowcase() {
  return (
    <section id="products" className="py-20 bg-[#F8F6F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left */}
          <div className="flex-1">
            <span className="inline-block bg-brand-forest/10 text-brand-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">What You'll Promote</span>
            <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-5">Authentic Products <br/>People Love</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Every product is made by rural women in their homes or village SHG kitchens — pure, natural, and loved by families across India.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PRODUCTS.map(({ name, emoji, desc }) => (
                <div key={name} className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <span className="text-3xl mb-2 block">{emoji}</span>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – image */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/product_collage.png" alt="Homemade Products" width={520} height={420} className="object-cover w-full h-[380px] sm:h-[420px]" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-brand-gold text-white rounded-2xl p-4 shadow-xl">
                <p className="text-xs font-semibold opacity-80 mb-1">Customer Retention</p>
                <p className="text-2xl font-dm-serif font-bold">97%</p>
                <p className="text-xs opacity-70">repeat purchases</p>
              </div>
            </div>
          </div>
        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Success Stories
// ──────────────────────────────────────────────────────────────

function SuccessStories() {
  const [active, setActive] = useState(0);

  return (
    <section id="stories" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-14">
          <span className="inline-block bg-pink-50 text-pink-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Real Women · Real Earnings</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">Success Stories</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">Thousands of women across India are earning monthly with U-Turn4Nature PIC.</p>
        </FadeSection>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {SUCCESS_STORIES.map(({ name, location, income, img, quote }, i) => (
            <FadeSection key={name} delay={i * 100}>
              <div className="bg-[#F8F6F0] rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="relative h-56 overflow-hidden">
                  <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg leading-tight">{name}</p>
                    <p className="text-sm text-white/80 flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-brand-gold text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">{income}</div>
                </div>
                <div className="p-5">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">"{quote}"</p>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="bg-[#F8F6F0] rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-64 overflow-hidden">
              <Image src={SUCCESS_STORIES[active].img} alt={SUCCESS_STORIES[active].name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-xl">{SUCCESS_STORIES[active].name}</p>
                <p className="text-sm text-white/80">{SUCCESS_STORIES[active].location}</p>
              </div>
              <div className="absolute top-4 right-4 bg-brand-gold text-white text-sm font-bold px-3 py-1 rounded-full">{SUCCESS_STORIES[active].income}</div>
            </div>
            <div className="p-5">
              <div className="flex mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />)}</div>
              <p className="text-gray-600 text-sm italic">"{SUCCESS_STORIES[active].quote}"</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => setActive(a => (a - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {SUCCESS_STORIES.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? 'bg-brand-forest scale-125' : 'bg-gray-300'}`} />
            ))}
            <button onClick={() => setActive(a => (a + 1) % SUCCESS_STORIES.length)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Trust Section
// ──────────────────────────────────────────────────────────────

function TrustSection() {
  return (
    <FadeSection>
      <section className="py-14 bg-brand-forest">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <p className="text-center text-brand-sage text-sm font-semibold uppercase tracking-widest mb-8">Certified · Verified · Trusted</p>
          <div className="flex flex-wrap justify-center gap-4">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

// ──────────────────────────────────────────────────────────────
// Final CTA
// ──────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <FadeSection>
      <section className="py-20 bg-[#F8F6F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="bg-gradient-to-br from-brand-forest to-brand-olive rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
            </div>
            <Zap className="w-12 h-12 text-brand-gold mx-auto mb-4 relative z-10" />
            <h2 className="font-dm-serif text-4xl sm:text-5xl mb-4 relative z-10">Ready to Start Earning?</h2>
            <p className="text-brand-sage text-lg mb-8 max-w-xl mx-auto relative z-10">
              Join 10,000+ PICs who are earning monthly while making a real difference in India's rural women empowerment movement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold text-white font-bold text-lg rounded-2xl hover:bg-amber-500 transition-all shadow-xl hover:-translate-y-1">
                Register Free Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition-all">
                Already a PIC? Login
              </Link>
            </div>
            <p className="mt-6 text-brand-sage/70 text-sm relative z-10">No investment · No inventory · No selling pressure · Just share awareness</p>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

// ──────────────────────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          {/* Full stacked logo — best for footer where space is available */}
          <div className="bg-white rounded-2xl p-3 inline-block mb-4 shadow-md border border-gray-100">
            <Image src="/logo_2.jpg" alt="U-Turn4Nature" width={180} height={80} className="object-contain h-20 w-auto" />
          </div>
          <p className="text-sm leading-relaxed text-gray-400 mb-4">India's first exclusive pure homemade grocery brand. Creating dignified livelihoods for rural women.</p>
          <p className="text-xs text-brand-gold font-semibold">#100MillionWomen #HomemadeRevolution</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['How It Works', '#how-it-works'], ['Earnings', '#income'], ['Success Stories', '#stories'], ['Products', '#products']].map(([label, href]) => (
              <li key={label}><a href={href} className="text-sm text-gray-400 hover:text-brand-gold transition-colors">{label}</a></li>
            ))}
          </ul>
        </div>

        {/* PIC Portal */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">PIC Portal</h4>
          <ul className="space-y-2.5">
            {[['Register Free', '/register'], ['Partner Login', '/login'], ['Policy Document', '/policy.pdf']].map(([label, href]) => (
              <li key={label}><Link href={href} className="text-sm text-gray-400 hover:text-brand-gold transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Get In Touch</h4>
          <div className="space-y-3">
            <a href="tel:7703944883" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-brand-gold" /> 7703944883
            </a>
            <a href="mailto:support@u-turn.in" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-brand-gold" /> support@u-turn.in
            </a>
          </div>
          <div className="flex gap-3 mt-5">
            {[
              { icon: Share2, href: 'https://www.instagram.com/uturn4nature/', label: 'Instagram' },
              { icon: Video, href: 'https://www.youtube.com/@u-turn4nature', label: 'YouTube' },
              { icon: MessageCircle, href: 'https://www.facebook.com/UTurn4Nature', label: 'Facebook' },
            ].map(({ icon: Icon, href, label }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand-forest transition-colors">
                <Icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 px-4 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 U-TURN4NATURE LLP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>GSTIN: 09AAFFU8734N2ZC</span>
            <span>·</span>
            <span>FSSAI Certified</span>
            <span>·</span>
            <span>Plot No. 4, Ecotech 3, Greater Noida – 201306</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] font-sans">
      <Navbar />
      <Ticker />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <IncomeSection />
      <ProductShowcase />
      <SuccessStories />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
