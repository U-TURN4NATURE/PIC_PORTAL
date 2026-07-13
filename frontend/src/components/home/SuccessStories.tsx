"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { G, G2, GOLD, CREAM } from './constants';
import FadeSection from './FadeSection';

const SUCCESS_STORIES = [
  {
    name: 'Bandna',
    location: 'Delhi',
    img: '/bandna.jpg.png',
    quote: 'Joining U-Turn4Nature gave me more than an opportunity—it gave me a purpose. Every day, I help empower women while delivering pure, homemade, chemical-free products to families.',
    role: 'Partner in Change',
    objectPosition: '50% 20%',
    imgHeight: 'h-80',
  },
  {
    name: 'Deepti',
    location: 'Ghaziabad',
    img: '/deepti.jpg.png',
    quote: 'The moment I joined U-Turn4Nature, I realized this was more than a business. Every effort helps empower rural women, strengthen village communities, and bring genuinely homemade, chemical-free products to families across India.',
    role: 'Partner in Change',
    objectPosition: '50% 20%',
    imgHeight: 'h-80',
  },
  {
    name: 'Nisha Nagar',
    location: 'Noida',
    img: '/nisha_nagar.jpg.png',
    quote: 'As a Partner in Change, I support UTurn4Nature by bringing authentic homemade products to every home while empowering rural women across India.',
    role: 'Partner in Change',
    objectPosition: '50% 25%',
    imgHeight: 'h-80',
  },
  {
    name: 'Sumiti',
    location: 'Noida',
    img: '/sumiti.png',
    quote: 'I believe food should nourish families and communities. As a Partner in Change, I promote authentic homemade products while empowering rural women entrepreneurs.',
    role: 'Partner in Change',
    objectPosition: '50% 20%',
    imgHeight: 'h-80',
  },
  {
    name: 'Rekha Verma',
    location: 'India',
    img: '/women_6.webp',
    quote: "I started by sharing U-Turn4Nature with a few people I knew. As they experienced the taste and quality of our homemade, chemical-free products, they began recommending them to others. That's how our community continues to grow—through trust.",
    role: 'Partner in Change',
  },
];

const VISIBLE = 3;

function StoryCard({ story, index }: { story: typeof SUCCESS_STORIES[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isLong = story.quote.length > 120;
  const displayQuote = !isLong || expanded ? story.quote : story.quote.slice(0, 118) + '…';

  const cardBgs = [
    { bg: '#f0f7f4', border: '#c8e6c9' },   // soft sage green
    { bg: '#fdf6ee', border: '#f0d9b5' },   // warm sand
    { bg: '#f3f0fb', border: '#d4c5f9' },   // soft lavender
    { bg: '#fff8f0', border: '#ffd8a8' },   // peach
    { bg: '#f0faf5', border: '#b7e4c7' },   // mint green
    { bg: '#fef9ec', border: '#f9e4b7' },   // warm cream
  ];
  const cardStyle = cardBgs[index % cardBgs.length];

  return (
    <div
      className="flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 group h-full"
      style={{ background: cardStyle.bg, border: `1px solid ${cardStyle.border}` }}
    >
      {/* Photo */}
      <div className={`relative ${(story as any).imgHeight ?? 'h-52'} overflow-hidden flex-shrink-0`}>
        {!imgError ? (
          <Image
            src={story.img}
            alt={`${story.name} — U-Turn4Nature success story`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ objectPosition: (story as any).objectPosition ?? 'center' }}
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={true}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${cardStyle.border}, ${cardStyle.bg})` }}
          >
            <span className="text-white text-5xl font-bold opacity-80">
              {story.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <p className="font-bold text-base leading-tight">{story.name}</p>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{story.location}
          </p>
        </div>
        {/* Role badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white backdrop-blur-sm"
            style={{ background: 'rgba(27,67,50,0.75)' }}>
            {story.role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, j) => (
            <Star key={j} className="w-4 h-4" style={{ fill: GOLD, color: GOLD }} />
          ))}
        </div>

        {/* Quote */}
        <div className="relative flex-1">
          <Quote className="w-7 h-7 absolute -top-1 -left-1 opacity-10" style={{ color: G }} />
          <p className="text-gray-600 text-sm leading-relaxed italic pl-6">
            {displayQuote}
          </p>
        </div>

        {/* Expand button */}
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold self-start px-3 py-1.5 rounded-full transition-all duration-200"
            style={{ color: G, background: `${G}12` }}
          >
            {expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Read more</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SuccessStories() {
  const [start, setStart] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);
  const [paused, setPaused] = useState(false);
  const total = SUCCESS_STORIES.length;

  const prev = () => {
    setAnimDir('right');
    setStart(s => (s - 1 + total) % total);
  };
  const next = () => {
    setAnimDir('left');
    setStart(s => (s + 1) % total);
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [paused, start]);

  // Get 3 visible cards with wrap-around
  const visibleStories = Array.from({ length: VISIBLE }, (_, i) => ({
    story: SUCCESS_STORIES[(start + i) % total],
    origIndex: (start + i) % total,
  }));

  return (
    <section id="stories" className="py-24" style={{ background: CREAM }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <FadeSection className="text-center mb-14">
          <span
            className="inline-block text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}
          >
            Real Women · Real Earnings
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', letterSpacing: '-0.02em' }}
          >
            What Customers, Rural Women Entrepreneurs (RWE), PICs and Mentors Says!
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Thousands of women across India are earning monthly with U-Turn4Nature PIC.
          </p>
        </FadeSection>

        {/* Desktop Carousel */}
        <div
          className="hidden md:block"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative">
            {/* Cards */}
            <div className="grid grid-cols-3 gap-6">
              {visibleStories.map(({ story, origIndex }, i) => (
                <StoryCard key={`${origIndex}-${start}`} story={story} index={origIndex} />
              ))}
            </div>

            {/* Arrows */}
            <button
              onClick={prev}
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-200 z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-200 z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {SUCCESS_STORIES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStart(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === start ? '28px' : '10px',
                  height: '10px',
                  background: i === start ? G2 : '#d1d5db',
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile single card carousel */}
        <div
          className="md:hidden"
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            key={start}
            style={{ animation: 'fadeInCard 0.4s ease' }}
          >
            <StoryCard story={SUCCESS_STORIES[start]} index={start} />
          </div>

          <div className="flex justify-center items-center gap-4 mt-5">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {SUCCESS_STORIES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStart(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === start ? '24px' : '10px',
                  height: '10px',
                  background: i === start ? G2 : '#d1d5db',
                }}
              />
            ))}
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow hover:shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
