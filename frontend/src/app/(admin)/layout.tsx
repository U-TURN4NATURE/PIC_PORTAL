"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Wallet, 
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Leaf,
  Flag
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, initAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-forest"></div>
    </div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'PIC Management', href: '/admin/pics', icon: Users },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Follow-up Requests', href: '/admin/followups', icon: Flag },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-brand-sage/20 shadow-sm z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-sage/20 bg-brand-forest">
          <div className="flex items-center space-x-2 text-white font-dm-serif text-xl">
            <div className="bg-white px-2 py-1 rounded-md flex items-center shadow-sm">
              <Image src="/logo_2.jpg" alt="U-Turn4Nature" width={100} height={30} className="object-contain mix-blend-multiply" />
            </div>
            <span className="text-sm font-medium opacity-80 border-l border-brand-sage/30 pl-2">Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-brand-sage hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-brand-forest/10 text-brand-forest border border-brand-forest/20 shadow-sm' : 'text-gray-600 hover:text-brand-forest hover:bg-brand-sage/10'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-forest' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-brand-sage/20 bg-gray-50/50">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#FDFBF7]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-brand-sage/20 shadow-sm flex items-center justify-between px-6 shrink-0 z-30 relative">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden text-brand-forest mr-4 hover:text-brand-olive"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-dm-serif text-brand-forest hidden sm:block">
              {navItems.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-brand-forest transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 border-l border-brand-sage/30 pl-4">
              <div className="w-9 h-9 rounded-full bg-brand-forest text-white flex items-center justify-center font-bold shadow-sm border border-brand-olive">
                {user?.name?.[0] || 'A'}
              </div>
              <span className="text-sm font-semibold text-gray-800 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
