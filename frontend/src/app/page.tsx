"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, CheckCircle2, Users, Heart, TrendingUp,
  ShieldCheck, Star, MapPin, Leaf, Award, Gift,
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
  const items = ['🌿 100% Homemade', '✅ Women-Led Production', '💰 No Investment Required', '📅 Monthly Earnings', '🏛️ FSSAI Certified', '🚀 10,000+ Active PICs', '🌾 500+ SHGs Empowered', '💗 Partner in Change'];
  return (
    <div className="overflow-hidden whitespace-nowrap py-0" style={{background: 'linear-gradient(90deg, #2E7D32 0%, #E91E8C 50%, #2E7D32 100%)'}}>
      <div className="inline-flex gap-12 animate-marquee py-2.5">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-sm font-semibold tracking-wide text-white">{t}</span>
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
            <span className="block text-[10px] font-bold leading-tight tracking-wide" style={{color:'#E91E8C'}}>Partner in Change</span>
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
          <Link href="/login"
            className="hidden sm:block px-4 py-2 font-semibold text-sm rounded-lg transition-all hover:-translate-y-0.5"
            style={{color:'#E91E8C'}}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(233,30,140,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background='transparent')}
          >
            Login
          </Link>
          <Link href="/register"
            className="px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
            style={{background:'linear-gradient(135deg,#E91E8C,#c4157a)', boxShadow:'0 4px 14px rgba(233,30,140,0.35)'}}>
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-forest/10 to-pink-100 border border-brand-pink/30 rounded-full px-4 py-1.5 mb-6">
            <Leaf className="w-4 h-4 text-brand-forest" />
            <span className="text-brand-forest text-sm font-semibold">India's Homemade Revolution · #100MillionWomen</span>
          </div>

          <h1 className="font-dm-serif leading-tight mb-4">
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-gray-900 font-bold mb-1">A Lifetime Business</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-gray-900 font-bold mb-4">Opportunity</span>
            <span className="block text-lg sm:text-xl text-brand-forest font-semibold mb-2">Become</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-extrabold" style={{color: '#E91E8C'}}>
              &ldquo;Partner in Change&rdquo;
              <svg className="w-full mt-1" viewBox="0 0 400 6" preserveAspectRatio="none" fill="none">
                <path d="M0 4 Q100 1 200 4 Q300 7 400 4" stroke="#E91E8C" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-lg italic">
            This program gives individuals a chance not only to{' '}
            <strong style={{color: '#E91E8C'}}>earn lifelong income</strong> but also to become{' '}
            <strong className="text-brand-forest">co-architects of women empowerment.</strong>
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2.5 mb-8 max-w-md">
            {[
              { label: '✔ 100% Homemade', pink: false },
              { label: '✔ Women-led Production', pink: true },
              { label: '✔ No Investment Required', pink: true },
              { label: '✔ Monthly Earnings', pink: false },
            ].map(({ label, pink }) => (
              <div key={label} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm font-semibold shadow-sm"
                style={{border: `1px solid ${pink ? 'rgba(233,30,140,0.3)' : 'rgba(46,125,50,0.25)'}`, color: pink ? '#E91E8C' : '#2E7D32'}}>
                {label}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-200" style={{background: 'linear-gradient(135deg, #E91E8C 0%, #c4157a 100%)', boxShadow: '0 8px 24px rgba(233,30,140,0.35)'}}>
              Join Now — Register Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-brand-forest text-white font-bold text-base rounded-2xl shadow-xl shadow-brand-forest/30 hover:bg-brand-forest/90 hover:-translate-y-1 transition-all duration-200">
              Register Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
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
          {STATS.map(({ value, label, icon: Icon }, idx) => (
            <div key={label} className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 group-hover:scale-110 transition-transform"
                style={{background: idx % 2 === 0 ? 'linear-gradient(135deg,#2E7D32,#6B7C3A)' : 'linear-gradient(135deg,#E91E8C,#c4157a)'}}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-dm-serif font-bold" style={{color: idx % 2 === 0 ? '#2E7D32' : '#E91E8C'}}>{value}</p>
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
    <section id="how-it-works" className="py-24" style={{background:'linear-gradient(180deg,#F8F6F0 0%,#fff 100%)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white" style={{background:'linear-gradient(135deg,#2E7D32,#E91E8C)'}}>Simple 4-Step Process</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">From registration to monthly income — it's simpler than you think.</p>
        </FadeSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map(({ step, icon: Icon, title, desc }, i) => (
            <FadeSection key={step} delay={i * 130}>
              <div className="group relative bg-white rounded-3xl p-7 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center h-full overflow-hidden">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{background: i % 2 !== 0 ? 'linear-gradient(90deg,#E91E8C,#c4157a)' : 'linear-gradient(90deg,#2E7D32,#6B7C3A)'}} />
                {/* Background step number watermark */}
                <div className="absolute -bottom-3 -right-2 text-[80px] font-dm-serif font-black select-none leading-none"
                  style={{color: i % 2 !== 0 ? 'rgba(233,30,140,0.06)' : 'rgba(46,125,50,0.06)'}}>{step}</div>
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg"
                  style={{background: i % 2 !== 0 ? 'linear-gradient(135deg,#E91E8C,#c4157a)' : 'linear-gradient(135deg,#2E7D32,#6B7C3A)', boxShadow: i % 2 !== 0 ? '0 8px 24px rgba(233,30,140,0.35)' : '0 8px 24px rgba(46,125,50,0.35)'}}>
                  <Icon className="w-7 h-7" />
                </div>
                {/* Step pill */}
                <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                  style={{background: i % 2 !== 0 ? 'rgba(233,30,140,0.1)' : 'rgba(46,125,50,0.1)', color: i % 2 !== 0 ? '#E91E8C' : '#2E7D32'}}>Step {step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{desc}</p>
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
    <section id="income" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 text-white" style={{background:'linear-gradient(135deg,#D4AF37,#b8941e)'}}>Earning Potential</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">Your Income, Your Choice</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">The more awareness you spread, the more you earn — every month, for life.</p>
        </FadeSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {INCOME_TIERS.map(({ name, customers, monthly, icon: Icon, color, badge, features, highlight }, i) => (
            <FadeSection key={name} delay={i * 130}>
              {/* Outer wrapper — no overflow-hidden so badge is never clipped */}
              <div className={`relative h-full flex flex-col transition-all duration-300 ${
                highlight ? 'scale-105 z-10' : 'hover:-translate-y-1'
              }`} style={{paddingTop: highlight ? '18px' : '0'}}>

                {/* "Most Popular" badge sits OUTSIDE the card so it's fully visible */}
                {highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-brand-gold text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg tracking-wide whitespace-nowrap">
                    ⭐ {badge}
                  </div>
                )}

                {/* Inner card with overflow-hidden for decorative shapes */}
                <div className={`rounded-3xl overflow-hidden flex-1 flex flex-col ${
                  highlight
                    ? 'ring-2 ring-brand-forest shadow-2xl shadow-brand-forest/25'
                    : 'border border-gray-100 shadow-lg'
                }`}>
                  {/* Card header */}
                  <div className={`bg-gradient-to-br ${color} p-8 text-white relative`}>
                    {/* Decorative circle */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    {!highlight && (
                      <div className="absolute top-4 right-4 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">{badge}</div>
                    )}
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{name}</h3>
                    <p className="text-white/70 text-sm mb-5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />{customers} Active Customers
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-dm-serif font-bold">{monthly}</span>
                      <span className="text-white/60 text-sm mb-1">/month</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="bg-white flex-1 p-6">
                    <ul className="space-y-3">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-brand-forest/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-forest" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* WhatsApp CTA below cards */}
        <FadeSection>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/917703944883?text=Hi%2C%20I%20want%20to%20become%20a%20Partner%20in%20Change%20with%20U-Turn4Nature"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-200"
              style={{background:'linear-gradient(135deg,#25D366,#128C7E)', boxShadow:'0 8px 24px rgba(37,211,102,0.35)'}}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
            <p className="text-gray-400 text-sm">* Earnings based on 5% contribution. Actual income depends on customer activity.</p>
          </div>
        </FadeSection>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// Product Showcase
// ──────────────────────────────────────────────────────────────

const PRODUCT_COLORS = [
  'linear-gradient(135deg,#2E7D32,#6B7C3A)',
  'linear-gradient(135deg,#E91E8C,#c4157a)',
  'linear-gradient(135deg,#D4AF37,#b8941e)',
  'linear-gradient(135deg,#2E7D32,#6B7C3A)',
  'linear-gradient(135deg,#E91E8C,#c4157a)',
  'linear-gradient(135deg,#D4AF37,#b8941e)',
];

function ProductShowcase() {
  return (
    <section id="products" className="py-24 bg-[#F8F6F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="flex flex-col lg:flex-row gap-14 items-center">
          {/* Left */}
          <div className="flex-1">
            <span className="inline-block bg-brand-forest/10 text-brand-forest text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">What You'll Promote</span>
            <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-5">Authentic Products <br/>People Love</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Every product is made by rural women in their homes or village SHG kitchens — pure, natural, and loved by families across India.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PRODUCTS.map(({ name, emoji, desc }, idx) => (
                <div key={name} className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200"
                    style={{background: PRODUCT_COLORS[idx]}}>
                    {emoji}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
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
              {/* Floating badge - retention */}
              <div className="absolute -bottom-5 -right-5 rounded-2xl p-4 shadow-xl text-white"
                style={{background:'linear-gradient(135deg,#D4AF37,#b8941e)'}}>
                <p className="text-xs font-semibold opacity-80 mb-0.5">Customer Retention</p>
                <p className="text-3xl font-dm-serif font-bold">97%</p>
                <p className="text-xs opacity-70">repeat purchases</p>
              </div>
              {/* Floating badge - women */}
              <div className="absolute -top-5 -left-5 rounded-2xl p-4 shadow-xl text-white"
                style={{background:'linear-gradient(135deg,#E91E8C,#c4157a)'}}>
                <p className="text-xs font-semibold opacity-80 mb-0.5">Women Empowered</p>
                <p className="text-2xl font-dm-serif font-bold">500+</p>
                <p className="text-xs opacity-70">SHG Villages</p>
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
          <span className="inline-block text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4" style={{background:'linear-gradient(135deg,#E91E8C,#c4157a)'}}>Real Women · Real Earnings</span>
          <h2 className="font-dm-serif text-4xl sm:text-5xl text-gray-900 mb-4">Success Stories</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">Thousands of women across India are earning monthly with U-Turn4Nature PIC.</p>
        </FadeSection>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {SUCCESS_STORIES.map(({ name, location, income, img, quote }, i) => (
            <FadeSection key={name} delay={i * 110}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="relative h-60 overflow-hidden">
                  <Image src={img} alt={name} fill className="object-cover group-hover:scale-107 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg leading-tight">{name}</p>
                    <p className="text-sm text-white/80 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{location}</p>
                  </div>
                  <div className="absolute top-4 right-4 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg"
                    style={{background:'linear-gradient(135deg,#E91E8C,#c4157a)'}}>{income}</div>
                </div>
                <div className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-brand-gold text-brand-gold" />)}
                  </div>
                  <div className="relative">
                    <span className="absolute -top-1 -left-1 text-5xl font-dm-serif leading-none" style={{color:'rgba(233,30,140,0.15)'}}>&ldquo;</span>
                    <p className="text-gray-600 text-sm leading-relaxed italic pl-4">{quote}</p>
                  </div>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-64 overflow-hidden">
              <Image src={SUCCESS_STORIES[active].img} alt={SUCCESS_STORIES[active].name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-xl">{SUCCESS_STORIES[active].name}</p>
                <p className="text-sm text-white/80">{SUCCESS_STORIES[active].location}</p>
              </div>
              <div className="absolute top-4 right-4 text-white text-sm font-bold px-3 py-1.5 rounded-full"
                style={{background:'linear-gradient(135deg,#E91E8C,#c4157a)'}}>{SUCCESS_STORIES[active].income}</div>
            </div>
            <div className="p-5">
              <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-brand-gold text-brand-gold" />)}</div>
              <p className="text-gray-600 text-sm italic">&ldquo;{SUCCESS_STORIES[active].quote}&rdquo;</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 mt-5">
            <button onClick={() => setActive(a => (a - 1 + SUCCESS_STORIES.length) % SUCCESS_STORIES.length)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:shadow-md transition-all">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {SUCCESS_STORIES.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{width: i === active ? '24px' : '10px', height:'10px', background: i === active ? '#E91E8C' : '#d1d5db'}} />
            ))}
            <button onClick={() => setActive(a => (a + 1) % SUCCESS_STORIES.length)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:shadow-md transition-all">
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
      <section className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg,#1b5e20 0%,#2E7D32 40%,#E91E8C 100%)'}}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
          <p className="text-center text-white/70 text-xs font-bold uppercase tracking-widest mb-8 letter-spacing-wider">Certified · Verified · Trusted by Thousands</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label}
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 text-white backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-default"
                style={{background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)'}}>
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

// ──────────────────────────────────────────────────────────────
// Final CTA
// ──────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <FadeSection>
      <section className="py-20 bg-[#F8F6F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl"
            style={{background: 'linear-gradient(135deg, #2E7D32 0%, #E91E8C 60%, #c4157a 100%)'}}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-block bg-white/20 border border-white/30 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-bold mb-5 text-white">
                💗 A Lifetime Business Opportunity
              </div>
              <h2 className="font-dm-serif text-4xl sm:text-5xl mb-2">Join Now as a</h2>
              <p className="font-dm-serif text-3xl sm:text-4xl font-extrabold mb-6" style={{color:'#FFD6EE', textShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>"Partner in Change"</p>
              <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                Join 10,000+ PICs earning lifelong income while becoming co-architects of women empowerment across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold text-lg rounded-2xl transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl" style={{color:'#E91E8C'}}>
                  Join Now — Register Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition-all">
                  Already a PIC? Login
                </Link>
              </div>
              <p className="mt-6 text-white/70 text-sm">No investment · No inventory · No selling pressure · Just share awareness</p>
            </div>
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
