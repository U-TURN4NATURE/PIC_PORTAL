"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { G, G2, GOLD, CREAM } from './constants';
import FadeSection from './FadeSection';

const SUCCESS_STORIES = [
  {
    name: 'Priya Sharma',
    location: 'Noida',
    income: '₹65,000/mo',
    img: '/women_3.webp',
    quote: 'Within 2 months I have 85 active customers. The products sell themselves – homemade quality speaks for itself.',
  },
];

export default function SuccessStories() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(a => (a + 1) % SUCCESS_STORIES.length), 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="stories" className="py-24" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <FadeSection className="text-center mb-14">
          <span className="inline-block text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>Real Women · Real Earnings</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: '-0.02em' }}>What Customers, Rural Women Entrepreneurs (RWE), PICs and Mentors Says!</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">Thousands of women across India are earning monthly with U-Turn4Nature PIC.</p>
        </FadeSection>

        {/* Desktop single-col centered */}
        <div className="hidden md:flex md:justify-center gap-8">
          {SUCCESS_STORIES.map(({ name, location, income, img, quote }, i) => (
            <FadeSection key={name} delay={i * 110} className="w-full max-w-md">
              <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                {/* Photo */}
                <div className="relative h-60 overflow-hidden">
                  <Image src={img} alt={`${name} — U-Turn4Nature PIC success story`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg leading-tight">{name}</p>
                    <p className="text-sm text-white/80 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4" style={{ fill: GOLD, color: GOLD }} />)}
                  </div>
                  <div className="relative">
                    <span className="absolute -top-1 -left-1 text-5xl leading-none font-serif" style={{ color: `${G}15` }}>&ldquo;</span>
                    <p className="text-gray-600 text-sm leading-relaxed italic pl-5">{quote}</p>
                  </div>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>

        {/* Mobile auto-scroll carousel */}
        <div className="md:hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-64 overflow-hidden">
              <Image src={SUCCESS_STORIES[active].img} alt={SUCCESS_STORIES[active].name} fill className="object-cover transition-opacity duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-xl">{SUCCESS_STORIES[active].name}</p>
                <p className="text-sm text-white/80">{SUCCESS_STORIES[active].location}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4" style={{ fill: GOLD, color: GOLD }} />)}</div>
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
                style={{ width: i === active ? '24px' : '10px', height: '10px', background: i === active ? G2 : '#d1d5db' }} />
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
