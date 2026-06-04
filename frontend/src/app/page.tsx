import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ArrowRight, Users, Heart, TrendingUp, ShieldCheck, Star, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-beige flex flex-col relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-olive/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 md:px-12 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="flex items-center space-x-2 text-brand-forest">
          <Image src="/logo_2.jpg" alt="U-Turn4Nature Logo" width={180} height={60} className="object-contain mix-blend-multiply" />
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="px-5 py-2 text-brand-forest font-medium hover:bg-white/50 rounded-lg transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2 bg-brand-forest text-white font-medium rounded-lg hover:bg-brand-forest/90 transition-colors shadow-md">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">
        <div className="inline-block px-4 py-1.5 rounded-full border border-brand-sage bg-white/60 text-brand-forest text-sm font-medium mb-6">
          🌿 India&apos;s Homemade Revolution
        </div>

        <h1 className="font-dm-serif text-5xl md:text-7xl text-gray-900 mb-4 max-w-4xl leading-tight">
          Earn with <span className="text-brand-gold">Purpose</span>.<br />
          Partner in <span className="text-brand-forest">Change</span>.
        </h1>

        <p className="text-base md:text-lg text-brand-olive font-semibold mb-4 tracking-wide">
          #100MillionWomen &nbsp;•&nbsp; अब Homemade खाएगा India
        </p>

        <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl leading-relaxed">
          Join U-Turn4Nature as a <strong>Partner in Change (PIC)</strong> — India&apos;s first exclusive homemade grocery movement
          created by rural women entrepreneurs, SHGs, FPOs &amp; co-operatives. You are not a sales agent —
          you are a <strong>Community Leader, an Ambassador of Homemade Food</strong>.
        </p>

        {/* Why PIC Banner */}
        <div className="bg-white/70 backdrop-blur-sm border border-brand-sage/40 rounded-2xl px-8 py-5 mb-8 max-w-2xl w-full text-left shadow-sm">
          <p className="text-sm font-bold text-brand-forest uppercase tracking-widest mb-3">PICs are NOT Sales Agents. They are:</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-forest flex-shrink-0" /> Ambassadors of Homemade Food</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-forest flex-shrink-0" /> Community Leaders</div>
            <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-brand-forest flex-shrink-0" /> Supporters of Rural Women</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-brand-forest flex-shrink-0" /> Partners in a National Movement</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
          <Link href="/register" className="px-8 py-4 bg-brand-forest text-white font-medium rounded-xl hover:bg-brand-forest/90 transition-colors shadow-lg shadow-brand-forest/30 flex items-center justify-center group">
            Join Now — It&apos;s Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white text-brand-forest font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-md border border-brand-sage/50 flex items-center justify-center">
            Partner Login
          </Link>
        </div>

        {/* Example Earnings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-brand-sage/40 shadow-sm max-w-2xl w-full overflow-hidden">
          <div className="bg-brand-forest px-6 py-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">💰 Lifetime Awareness Sharing Benefits</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-brand-sage/30">
            <div className="px-4 py-5 text-center">
              <p className="text-2xl font-dm-serif text-brand-forest font-bold">100</p>
              <p className="text-xs text-gray-500 mt-1">Customers</p>
              <p className="text-base font-bold text-brand-gold mt-2">₹12,000<span className="text-xs font-normal text-gray-500">/mo</span></p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-2xl font-dm-serif text-brand-forest font-bold">500</p>
              <p className="text-xs text-gray-500 mt-1">Customers</p>
              <p className="text-base font-bold text-brand-gold mt-2">₹60,000<span className="text-xs font-normal text-gray-500">/mo</span></p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-2xl font-dm-serif text-brand-forest font-bold">1000</p>
              <p className="text-xs text-gray-500 mt-1">Customers</p>
              <p className="text-base font-bold text-brand-gold mt-2">₹1,20,000<span className="text-xs font-normal text-gray-500">/mo</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Features/Stats Footer */}
      <footer className="relative z-10 border-t border-brand-sage/30 bg-white/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-dm-serif text-brand-forest mb-2">5%</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Contribution Rate</div>
          </div>
          <div>
            <div className="text-3xl font-dm-serif text-brand-gold mb-2">Zero</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Investment Needed</div>
          </div>
          <div>
            <div className="text-3xl font-dm-serif text-brand-forest mb-2">∞</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Unlimited Referrals</div>
          </div>
          <div>
            <div className="text-3xl font-dm-serif text-brand-gold mb-2">Monthly</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Transparent Payouts</div>
          </div>
        </div>

        {/* Mission Strip */}
        <div className="border-t border-brand-sage/20 bg-brand-forest/5 px-6 py-4">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-xs text-gray-500 text-center">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Rural Livelihoods</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Women Entrepreneurs</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Healthy Food Habits</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Sustainable Communities</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Empower 100 Million Women</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
