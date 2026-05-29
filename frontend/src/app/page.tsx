import Link from 'next/link';
import { Leaf, ArrowRight } from 'lucide-react';

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
          <Leaf className="w-6 h-6" />
          <span className="font-dm-serif text-xl font-bold tracking-wide">U-Turn4Nature</span>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="px-5 py-2 text-brand-forest font-medium hover:bg-white/50 rounded-lg transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2 bg-brand-forest text-white font-medium rounded-lg hover:bg-brand-forest/90 transition-colors shadow-md">
            Become a Partner
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">
        <div className="inline-block px-4 py-1.5 rounded-full border border-brand-sage bg-white/60 text-brand-forest text-sm font-medium mb-8">
          🌱 Join the sustainable revolution
        </div>
        
        <h1 className="font-dm-serif text-5xl md:text-7xl text-gray-900 mb-6 max-w-4xl leading-tight">
          Partner with <span className="text-brand-forest">Nature</span>.<br/>Earn with <span className="text-brand-gold">Purpose</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
          Join the U-Turn4Nature Partner In Charge (PIC) program. Share our premium organic products, promote a sustainable lifestyle, and earn 5% commission on every successful referral.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register" className="px-8 py-4 bg-brand-forest text-white font-medium rounded-xl hover:bg-brand-forest/90 transition-colors shadow-lg shadow-brand-forest/30 flex items-center justify-center group">
            Apply Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white text-brand-forest font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-md border border-brand-sage/50 flex items-center justify-center">
            Partner Login
          </Link>
        </div>
      </main>

      {/* Features/Stats Footer */}
      <footer className="relative z-10 border-t border-brand-sage/30 bg-white/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-dm-serif text-brand-forest mb-2">5%</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Commission Rate</div>
          </div>
          <div>
            <div className="text-3xl font-dm-serif text-brand-gold mb-2">100%</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Organic Products</div>
          </div>
          <div>
            <div className="text-3xl font-dm-serif text-brand-forest mb-2">Fast</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Payout Processing</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
