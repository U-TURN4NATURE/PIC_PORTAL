// ─────────────────────────────────────────────────
// Shared API Response Types
// ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────

export type NotificationType =
  | 'PIC_APPROVED'
  | 'PIC_REJECTED'
  | 'PIC_SUSPENDED'
  | 'NEW_ORDER'
  | 'NEW_COMMISSION'
  | 'PAYOUT_COMPLETED'
  | 'PAYOUT_FAILED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  picId?: string;
  adminId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// ─────────────────────────────────────────────────
// Announcement Types
// ─────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { name: string };
}

// ─────────────────────────────────────────────────
// PIC Partner Types
// ─────────────────────────────────────────────────

export type PICStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface PICPartnerSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  referralCode?: string;
  status: PICStatus;
  isEmailVerified: boolean;
  createdAt: string;
  wallet?: { totalEarnings: number; availableBalance: number };
  _count?: { orders: number };
}

// ─────────────────────────────────────────────────
// Order Types
// ─────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: string;
  shopifyOrderId: string;
  shopifyOrderNum?: string;
  picId?: string;
  referralCode?: string;
  customerName?: string;
  customerEmail?: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  pic?: { fullName: string; email: string; referralCode?: string };
}

// ─────────────────────────────────────────────────
// Wallet / Payout Types
// ─────────────────────────────────────────────────

export interface Wallet {
  id: string;
  picId: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  availableBalance: number;
  updatedAt: string;
}

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface Payout {
  id: string;
  picId: string;
  amount: number;
  status: PayoutStatus;
  paymentMethod: string;
  transactionRef?: string;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

// ─────────────────────────────────────────────────
// Dashboard Types
// ─────────────────────────────────────────────────

export interface TrendData {
  change: number;
  trend: 'up' | 'down' | 'flat';
}

export interface AdminDashboardStats {
  stats: {
    totalPICs: number;
    activePICs: number;
    pendingPICs: number;
    rejectedPICs: number;
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    totalCommissionPaid: number;
  };
  trends: {
    totalPICs: TrendData;
    activePICs: TrendData;
    pendingPICs: TrendData;
    totalOrders: TrendData;
    totalRevenue: TrendData;
    totalCommission: TrendData;
  };
  recentPICs: Array<{
    id: string;
    fullName: string;
    email: string;
    status: PICStatus;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{ month: string; revenue: number; commission: number }>;
}

export interface PICDashboardStats {
  wallet: Wallet;
  totalOrders: number;
  recentOrders: Order[];
}
