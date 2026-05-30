"use client";

import { useEffect } from 'react';
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
  Leaf,
  Clock,
  XCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

// ─── Status Screens ───────────────────────────────

function PendingScreen({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="font-dm-serif text-3xl text-brand-forest mb-3">Application Under Review</h1>
        <p className="text-gray-600 mb-2">Hi {user?.fullName?.split(' ')[0]},</p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your PIC application has been submitted and is currently being reviewed by our team.
          You will be notified via email once a decision has been made.
        </p>
        <div className="bg-white rounded-2xl border border-brand-sage/30 p-6 text-left space-y-3 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-brand-forest mb-3">Application Status</p>
          <StatusStep done label="Application Submitted" />
          <StatusStep active label="Under Admin Review" />
          <StatusStep label="Profile Completion" />
          <StatusStep label="Active Partner" />
        </div>
        <button
          onClick={async () => {
            await api.post('/auth/logout');
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function RejectedScreen({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-dm-serif text-3xl text-brand-forest mb-3">Application Not Approved</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We&apos;re sorry, {user?.fullName?.split(' ')[0]}. Your PIC application was not approved at this time.
        </p>
        {user?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-red-700 mb-1">Reason:</p>
            <p className="text-sm text-red-600">{user.rejectionReason}</p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-6">
          For any queries, please contact us at{' '}
          <a href="mailto:support@uturn4nature.com" className="text-brand-forest underline">
            support@uturn4nature.com
          </a>
        </p>
        <button
          onClick={async () => {
            await api.post('/auth/logout');
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function IncompleteProfileScreen({ user }: { user: any }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-sage/20 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-dm-serif text-3xl text-brand-forest mb-3">You&apos;re Approved! 🎉</h1>
        <p className="text-gray-600 mb-2">Congratulations, {user?.fullName?.split(' ')[0]}!</p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your PIC application has been approved. Please complete your KYC and profile details
          to activate your account and start earning.
        </p>
        <button
          onClick={() => router.push('/complete-profile')}
          className="w-full bg-brand-forest text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-forest/90 transition-all shadow-lg shadow-brand-forest/20 mb-4"
        >
          Complete My Profile <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={async () => {
            await api.post('/auth/logout');
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function StatusStep({ done, active, label }: { done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        done ? 'bg-green-500' : active ? 'bg-yellow-400 animate-pulse' : 'bg-gray-200'
      }`}>
        {done && <CheckCircle className="w-4 h-4 text-white" />}
        {active && <Clock className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${done ? 'text-green-700 font-medium' : active ? 'text-yellow-700 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────
export default function PICLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, initAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize auth from server on mount (fixes session validation bug)
  useEffect(() => {
    initAuth();
  }, []);

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
    } catch {
      toast.error('Logout failed');
    }
  };

  // Loading spinner
  if (isLoading || !isAuthenticated || user?.role !== 'PIC') {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-forest" />
      </div>
    );
  }

  // Status-based screens (no sidebar for non-active users)
  if (user.status === 'PENDING') return <PendingScreen user={user} />;
  if (user.status === 'REJECTED') return <RejectedScreen user={user} />;
  if (user.status === 'APPROVED' && !user.profileCompleted) return <IncompleteProfileScreen user={user} />;

  // ─── Full Dashboard (ACTIVE users only) ─────────
  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Referral Link', href: '/dashboard/referral', icon: LinkIcon },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

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
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-sage/10 to-transparent pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-sage/20 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-brand-forest mr-4 p-2 hover:bg-brand-sage/10 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-dm-serif text-brand-forest hidden sm:block">
              {navItems.find(item => isItemActive(item.href))?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 text-brand-olive hover:text-brand-forest hover:bg-brand-sage/10 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-gold rounded-full border border-white" />
            </button>
            <div className="h-8 w-px bg-brand-sage/30 mx-2" />
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
