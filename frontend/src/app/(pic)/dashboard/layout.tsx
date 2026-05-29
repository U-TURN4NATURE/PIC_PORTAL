"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  ShoppingCart, 
  Wallet, 
  TrendingUp,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function PICLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'PIC') {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'PIC') {
    return <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-forest"></div>
    </div>;
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Referral Link', href: '/dashboard/referral', icon: LinkIcon },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  // For PIC portal, exact match for overview, startsWith for others
  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-forest/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-brand-sage/30 shadow-[4px_0_24px_rgba(45,80,22,0.02)] z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-sage/20 bg-gradient-to-r from-brand-forest/5 to-transparent">
          <div className="flex items-center space-x-3 text-brand-forest font-dm-serif text-xl">
            <div className="bg-brand-forest text-white p-2 rounded-lg shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <span>PIC Portal</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-brand-forest/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-forest text-white shadow-md shadow-brand-forest/20' : 'text-gray-600 hover:text-brand-forest hover:bg-brand-sage/10'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-olive'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-brand-sage/20 bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[url('/assets/noise.png')] bg-repeat bg-opacity-5 relative">
        {/* Subtle background gradient */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-sage/10 to-transparent pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-sage/20 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden text-brand-forest mr-4 p-2 hover:bg-brand-sage/10 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-dm-serif text-brand-forest hidden sm:block">
                {navItems.find(item => isItemActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 text-brand-olive hover:text-brand-forest hover:bg-brand-sage/10 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-gold rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-brand-sage/30 mx-2"></div>
            <Link href="/dashboard/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-brand-forest flex items-center justify-center text-white font-bold shadow-md">
                {user?.fullName?.[0] || 'P'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-brand-olive font-medium">PIC Partner</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
