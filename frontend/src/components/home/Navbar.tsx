"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { G, G2, PINK, GOLD } from './constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Earnings', href: '#income' },
    { label: 'Stories', href: '#stories' },
    { label: 'Products', href: '#products' },
    { label: 'FAQ', href: '#faq' },
    { label: 'About Us', href: 'https://www.u-turn.in/about-us', external: true },
  ];

  return (
    <>
      {/* 3px top accent line — green + pink co-brand */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60]" style={{ background: `linear-gradient(90deg, ${G}, ${PINK}, ${G2})` }} />

      <nav className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5'
        : 'bg-white/80 backdrop-blur-md'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 sm:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="https://img.clevup.in/378284/LOGOUT2AUG25-1754702859985.jpeg?height=200&format=webp"
              alt="U-Turn4Nature logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="border-l-2 pl-3 py-0.5" style={{ borderColor: `${GOLD}40` }}>
              <span className="block text-xl font-bold leading-[1.1] tracking-tight" style={{ color: G }}>
                U-Turn
              </span>
              <span className="block text-xl font-bold leading-[1.1] tracking-tight mb-1">
                <span style={{ color: PINK }}>4</span> <span style={{ color: G }}>Nature</span>
              </span>
              <span className="block text-[10px] font-semibold leading-none tracking-wide" style={{ color: PINK }}>
                Homemade Goodness
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <a key={l.href} href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noreferrer' : undefined}
                className="text-sm font-semibold text-gray-600 hover:text-[#1B4332] transition-colors relative group">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300" style={{ background: G }} />
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login"
              className="px-4 py-2 text-sm font-bold rounded-lg border transition-all hover:-translate-y-0.5"
              style={{ color: PINK, borderColor: `${PINK}30` }}
            >Login</Link>
            <Link href="/register"
              className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${PINK}, #c4157a)`, boxShadow: `0 4px 14px ${PINK}40` }}
            >
              Register Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: menuOpen ? `${G}15` : 'transparent' }}>
            {menuOpen ? <X className="w-5 h-5" style={{ color: G }} /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ background: 'white', borderTop: `1px solid ${G}15` }}>
          <div className="px-4 py-5 space-y-1">
            {links.map(l => (
              <a key={l.href} href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                {l.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2.5 border-t border-gray-100 mt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-bold border"
                style={{ color: G, borderColor: `${G}30` }}>Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PINK}, #c4157a)` }}>
                Register Free — Takes 2 Minutes
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
