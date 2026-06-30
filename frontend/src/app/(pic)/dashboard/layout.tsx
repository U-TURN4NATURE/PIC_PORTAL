"use client";


import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
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
  FileText,
  Megaphone,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import PolicyModal from '@/components/PolicyModal';
import KycModal from '@/components/KycModal';
import ForceChangePasswordModal from '@/components/ForceChangePasswordModal';
import NotificationBell from '@/components/NotificationBell';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

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

function IncompleteProfileBanner({ user }: { user: any }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mx-6 lg:mx-10 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-800">🎉 Congratulations {user?.fullName?.split(' ')[0]}! Your application is approved.</p>
        <p className="text-xs text-green-700 mt-0.5">
          Complete your KYC, profile, and read the policy document to activate your referral code and start earning.
          <span className="text-gray-500"> (Optional — you can do this later)</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push('/complete-profile')}
          className="px-4 py-2 bg-brand-forest text-white text-xs font-semibold rounded-xl hover:bg-brand-forest/90 transition-colors flex items-center gap-1"
        >
          Complete Profile <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatusStep({ done, active, label }: { done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-500' : active ? 'bg-yellow-400 animate-pulse' : 'bg-gray-200'
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
  const [isSyncing, setIsSyncing] = useState(true);

  // Initialize auth from server on mount (fixes session validation bug)
  useEffect(() => {
    initAuth().finally(() => {
      setIsSyncing(false);
    });
  }, []);

  useEffect(() => {
    // Only redirect if we're fully done loading and definitely not authenticated.
    // If isLoading is still true (API in-flight), wait — don't redirect prematurely.
    if (!isLoading && (!isAuthenticated || user?.role !== 'PIC')) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.replace('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Announcement unread badge — must be declared before any early return
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'PIC') return;
    const checkNewAnnouncements = async () => {
      try {
        const res = await api.get('/pic/announcements');
        const announcements = res.data.data || [];
        const lastSeen = localStorage.getItem('pic_announcements_last_seen');
        if (!lastSeen && announcements.length > 0) {
          setHasNewAnnouncements(true);
        } else if (lastSeen && announcements.length > 0) {
          const latestDate = new Date(announcements[0].createdAt);
          setHasNewAnnouncements(latestDate > new Date(lastSeen));
        }
      } catch { /* silent */ }
    };
    checkNewAnnouncements();
  }, [pathname, isAuthenticated, user]);

  // Show spinner ONLY when actively loading with no cached user.
  // If we have a user from persisted state, render immediately.
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-forest" />
      </div>
    );
  }

  // Redirect handled by useEffect — render null briefly while it fires
  if (!isAuthenticated || user?.role !== 'PIC') {
    return null;
  }

  // Status-based screens (no sidebar for blocked users)
  if (user.status === 'PENDING') return <PendingScreen user={user} />;
  if (user.status === 'REJECTED') return <RejectedScreen user={user} />;
  // APPROVED users with incomplete profile get full dashboard + optional banner
  const showIncompleteProfileBanner = user.status === 'APPROVED' && !user.profileCompleted;

  // ─── Full Dashboard (ACTIVE users only) ─────────
  const showPolicyModal = user.profileCompleted && user.status === 'ACTIVE' && user.isPolicyAccepted === false;
  
  // Show KYC modal ONLY for ACTIVE users who are missing PAN or Aadhaar
  // APPROVED users (incomplete profile) should fill KYC through complete-profile page
  // Only show it if PolicyModal is NOT showing so they don't overlap
  // Wait until isSyncing is false to prevent flashing the modal for users who have data but local storage is outdated
  const showKycModal = !isSyncing && !showPolicyModal && user.status === 'ACTIVE' && (!user.panCard || !user.aadhaarNumber);

  // Force change password: Admin set a temp password — user must change before continuing
  const showForceChangePassword = !!(user as any).mustChangePassword;

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Referrals', href: '/dashboard/referral', icon: User },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { name: 'Policy & T&C', href: '/dashboard/policy', icon: FileText },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-gray-900 flex">
      {/* Force Change Password — highest priority, blocks everything */}
      {showForceChangePassword && (
        <ForceChangePasswordModal
          onSuccess={() => {
            initAuth(); // Refetch user data — mustChangePassword will be false after change
          }}
        />
      )}

      {showPolicyModal && (
        <PolicyModal
          onAccept={() => {
            initAuth(); // Refetches user data to update isPolicyAccepted
          }}
        />
      )}
      
      {showKycModal && (
        <KycModal
          onSuccess={() => {
            initAuth(); // Refetches user data to get updated KYC info
          }}
        />
      )}

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
          <div className="flex items-center gap-2.5">
            <div className="bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
              <Image src="/logo_1.jpg" alt="U-Turn4Nature" width={40} height={40} className="object-contain w-9 h-9 rounded-full" />
            </div>
            <div>
              <span className="block text-xs font-bold text-brand-forest leading-tight">U-Turn4Nature</span>
              <span className="block text-[9px] text-pink-500 font-semibold leading-tight">PIC Portal</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-brand-forest/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);
            const showBadge = item.href === '/dashboard/announcements' && hasNewAnnouncements && !isActive;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (item.href === '/dashboard/announcements') setHasNewAnnouncements(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-forest text-white shadow-md shadow-brand-forest/20' : 'text-gray-600 hover:text-brand-forest hover:bg-brand-sage/10'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-olive'}`} />
                <span className="font-medium flex-1">{item.name}</span>
                {showBadge && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                )}
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
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-sage/20 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30 sticky top-0">
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
            <NotificationBell role="PIC" />
            <div className="h-8 w-px bg-brand-sage/30 mx-2" />
            <Link href="/dashboard/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-brand-forest flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage.startsWith('http') ? user.profileImage : `${BACKEND_URL}${user.profileImage}`}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  user?.fullName?.[0] || 'P'
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-brand-olive font-medium">PIC Partner</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Incomplete Profile Banner — optional reminder for APPROVED users */}
        {showIncompleteProfileBanner && <IncompleteProfileBanner user={user} />}

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
