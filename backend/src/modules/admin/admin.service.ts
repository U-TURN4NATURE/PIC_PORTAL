import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { createError } from '../../middleware/error.middleware';
import { PICStatus, PayoutStatus, Prisma } from '@prisma/client';
import { generateReferralCode } from '../../utils/crypto.utils';
import { encrypt, decrypt } from '../../utils/crypto.utils';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPayoutEmail,
} from '../../services/email.service';
import { parsePagination } from '../../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Admin Service — Business Logic
// ─────────────────────────────────────────────────

// Simple in-memory cache for dashboard stats (TTL: 5 minutes)
let dashboardCache: { data: any; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get dashboard analytics
 */
export const getDashboardStats = async () => {
  const now = new Date();

  // Return cached data if valid
  if (dashboardCache.data && (now.getTime() - dashboardCache.timestamp < CACHE_TTL)) {
    return dashboardCache.data;
  }

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Batch 1: Global PIC Counts
  const [totalPICs, activePICs, pendingPICs, rejectedPICs, recentPICs] = await Promise.all([
    prisma.pICPartner.count(),
    prisma.pICPartner.count({ where: { status: { in: [PICStatus.APPROVED, PICStatus.ACTIVE] } } }),
    prisma.pICPartner.count({ where: { status: PICStatus.PENDING } }),
    prisma.pICPartner.count({ where: { status: PICStatus.REJECTED } }),
    prisma.pICPartner.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, status: true, createdAt: true },
    }),
  ]);

  // Batch 2: Global Orders & Revenue
  const [totalOrders, paidOrders, totalRevenue, totalCommission] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { orderAmount: true }, where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PAID' } }),
  ]);

  // Batch 3: Monthly Chart & Prev Month PICs
  const [monthlyRevenue, prevMonthPICs, prevMonthActivePICs, prevMonthPendingPICs] = await Promise.all([
    prisma.$queryRaw<{ month: string; revenue: number; commission: number }[]>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
        COALESCE(SUM("orderAmount"), 0) AS revenue,
        COALESCE(SUM("commissionAmount"), 0) AS commission
      FROM orders
      WHERE status = 'PAID' AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `,
    prisma.pICPartner.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.pICPartner.count({ where: { status: { in: [PICStatus.APPROVED, PICStatus.ACTIVE] }, approvedAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.pICPartner.count({ where: { status: PICStatus.PENDING, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
  ]);

  // Batch 4: Prev Month Orders & Current Month Stats
  const [
    prevMonthOrders, prevMonthRevenue, prevMonthCommission,
    thisMonthPICs, thisMonthOrders, thisMonthRevenue, thisMonthCommission
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.order.aggregate({ _sum: { orderAmount: true }, where: { status: 'PAID', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PAID', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.pICPartner.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.aggregate({ _sum: { orderAmount: true }, where: { status: 'PAID', createdAt: { gte: startOfThisMonth } } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PAID', createdAt: { gte: startOfThisMonth } } }),
  ]);

  const calcTrend = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? { change: 100, trend: 'up' } : { change: 0, trend: 'flat' };
    const pct = Math.round(((current - prev) / prev) * 100);
    return { change: Math.abs(pct), trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
  };

  const responseData = {
    stats: {
      totalPICs,
      activePICs,
      pendingPICs,
      rejectedPICs,
      totalOrders,
      paidOrders,
      totalRevenue: totalRevenue._sum.orderAmount || 0,
      totalCommissionPaid: totalCommission._sum.commissionAmount || 0,
    },
    trends: {
      totalPICs: calcTrend(thisMonthPICs, prevMonthPICs),
      activePICs: calcTrend(activePICs, prevMonthActivePICs),
      pendingPICs: calcTrend(pendingPICs, prevMonthPendingPICs),
      totalOrders: calcTrend(thisMonthOrders, prevMonthOrders),
      totalRevenue: calcTrend(
        thisMonthRevenue._sum.orderAmount || 0,
        prevMonthRevenue._sum.orderAmount || 0
      ),
      totalCommission: calcTrend(
        thisMonthCommission._sum.commissionAmount || 0,
        prevMonthCommission._sum.commissionAmount || 0
      ),
    },
    recentPICs,
    monthlyRevenue,
  };

  // Update Cache
  dashboardCache = { data: responseData, timestamp: now.getTime() };

  return responseData;
};


const CACHE_TTL_SHORT = 15 * 1000; // 15 seconds

const cacheGet = (key: string) => {
  const item = (global as any)[key];
  if (item && Date.now() - item.timestamp < CACHE_TTL_SHORT) return item.data;
  return null;
};
const cacheSet = (key: string, data: any) => {
  (global as any)[key] = { data, timestamp: Date.now() };
};

/**
 * Get all PICs with search, filter, and pagination
 */
export const getAllPICs = async (
  search?: string,
  status?: PICStatus,
  page = 1,
  limit = 10
) => {
  const cacheKey = `admin_pics_${search}_${status}_${page}_${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const { skip } = parsePagination(String(page), String(limit));

  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
        { referralCode: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && { status }),
  };

  const [pics, total] = await Promise.all([
    prisma.pICPartner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        state: true,
        city: true,
        referralCode: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        wallet: { select: { totalEarnings: true, availableBalance: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.pICPartner.count({ where }),
  ]);

  const result = { pics, total };
  cacheSet(cacheKey, result);
  return result;
};

/**
 * Get single PIC with full details (including KYC docs and timeline)
 */
export const getPICById = async (picId: string) => {
  const pic = await prisma.pICPartner.findUnique({
    where: { id: picId },
    include: {
      wallet: true,
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, shopifyOrderId: true, orderAmount: true,
          commissionAmount: true, status: true, createdAt: true,
        },
      },
      payouts: {
        take: 5,
        orderBy: { requestedAt: 'desc' },
      },
      _count: { select: { orders: true, payouts: true } },
    },
  });

  if (!pic) throw createError('PIC not found', 404);

  // Remove sensitive fields
  const { password, otpCode, resetToken, otpExpiresAt, resetTokenExpiry, ...safePIC } = pic;
  return safePIC;
};

// ─────────────────────────────────────────────────
// Admin Service — Bank Details Approvals
// ─────────────────────────────────────────────────

export const getBankApprovals = async () => {
  const pics = await prisma.pICPartner.findMany({
    where: {
      pendingBankDetails: { not: Prisma.JsonNull },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      bankAccountName: true,
      bankName: true,
      bankAccountNumber: true,
      ifscCode: true,
      branchName: true,
      upiId: true,
      pendingBankDetails: true,
      createdAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  return pics;
};

export const approveBankDetails = async (picId: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);
  if (!pic.pendingBankDetails) throw createError('No pending bank details found', 400);

  const pending = pic.pendingBankDetails as any;
  
  // Apply pending updates to main fields and clear pendingBankDetails
  const updatedPic = await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      bankAccountName: pending.bankAccountName ?? pic.bankAccountName,
      bankName: pending.bankName ?? pic.bankName,
      bankAccountNumber: pending.bankAccountNumber ?? pic.bankAccountNumber,
      ifscCode: pending.ifscCode ?? pic.ifscCode,
      branchName: pending.branchName ?? pic.branchName,
      upiId: pending.upiId ?? pic.upiId,
      pendingBankDetails: Prisma.DbNull, // clear it
    },
  });

  return updatedPic;
};

export const rejectBankDetails = async (picId: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);
  if (!pic.pendingBankDetails) throw createError('No pending bank details found', 400);

  // Clear pendingBankDetails without applying them
  const updatedPic = await prisma.pICPartner.update({
    where: { id: picId },
    data: {
      pendingBankDetails: Prisma.DbNull, // clear it
    },
  });

  return updatedPic;
};

/**
 * Approve a PIC — generates referral code + wallet + sends email
 */
export const approvePIC = async (picId: string, adminId: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);
  if (pic.status === PICStatus.APPROVED || pic.status === PICStatus.ACTIVE) {
    throw createError('PIC is already approved', 400);
  }

  // Generate unique referral code
  let referralCode = generateReferralCode(pic.fullName);
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.pICPartner.findFirst({ where: { referralCode } });
    if (!existing) break;
    referralCode = generateReferralCode(pic.fullName, 100 + attempts);
    attempts++;
  }

  const updatedPIC = await prisma.$transaction(async (tx) => {
    const updated = await tx.pICPartner.update({
      where: { id: picId },
      data: {
        status: PICStatus.APPROVED,
        referralCode,
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedAt: null,
      },
    });

    await tx.notification.create({
      data: {
        picId,
        type: 'PIC_APPROVED',
        title: 'Application Approved! 🎉',
        message: `Congratulations! Your PIC application has been approved. Please login and complete your KYC and profile details to get your referral code and start earning.`,
        metadata: { referralCode },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'APPROVE_PIC',
        targetId: picId,
        targetType: 'PICPartner',
        metadata: { referralCode },
      },
    });

    return updated;
  });

  sendApprovalEmail(pic.email, pic.fullName, referralCode).catch(console.error);
  return { id: updatedPIC.id, status: updatedPIC.status, referralCode };
};

/**
 * Reject a PIC
 */
export const rejectPIC = async (picId: string, adminId: string, reason?: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);

  await prisma.$transaction(async (tx) => {
    await tx.pICPartner.update({
      where: { id: picId },
      data: {
        status: PICStatus.REJECTED,
        rejectionReason: reason || null,
        rejectedAt: new Date(),
      },
    });
    await tx.notification.create({
      data: {
        picId,
        type: 'PIC_REJECTED',
        title: 'Application Update',
        message: reason
          ? `Your PIC application has been reviewed and was not approved. Reason: ${reason}`
          : 'Your PIC application has been reviewed and was not approved at this time. Please contact support for more information.',
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: adminId, actorRole: 'ADMIN',
        action: 'REJECT_PIC', targetId: picId, targetType: 'PICPartner',
        metadata: { reason },
      },
    });
  });

  sendRejectionEmail(pic.email, pic.fullName, reason).catch(console.error);
  return { message: 'PIC rejected successfully' };
};

/**
 * Suspend a PIC
 */
export const suspendPIC = async (picId: string, adminId: string, reason?: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);

  await prisma.$transaction(async (tx) => {
    await tx.pICPartner.update({ where: { id: picId }, data: { status: PICStatus.SUSPENDED } });
    await tx.notification.create({
      data: {
        picId,
        type: 'PIC_SUSPENDED',
        title: 'Account Suspended',
        message: reason || 'Your account has been temporarily suspended. Please contact admin.',
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: adminId, actorRole: 'ADMIN',
        action: 'SUSPEND_PIC', targetId: picId, targetType: 'PICPartner',
        metadata: { reason },
      },
    });
  });

  return { message: 'PIC suspended successfully' };
};

/**
 * Delete a PIC
 */
export const deletePIC = async (picId: string, adminId: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);

  await prisma.pICPartner.delete({ where: { id: picId } });
  await prisma.auditLog.create({
    data: {
      actorId: adminId, actorRole: 'ADMIN',
      action: 'DELETE_PIC', targetId: picId, targetType: 'PICPartner',
      metadata: { email: pic.email, name: pic.fullName },
    },
  });

  return { message: 'PIC deleted successfully' };
};

/**
 * Get all orders with filters
 */
export const getAllOrders = async (
  picId?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 10
) => {
  const cacheKey = `admin_orders_${picId}_${status}_${startDate}_${endDate}_${page}_${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const { skip } = parsePagination(String(page), String(limit));

  const where: Record<string, unknown> = {
    ...(picId && { picId }),
    ...(status && { status }),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        pic: { select: { fullName: true, email: true, referralCode: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const result = { orders, total };
  cacheSet(cacheKey, result);
  return result;
};

/**
 * Get all payouts
 */
export const getAllPayouts = async (status?: PayoutStatus, page = 1, limit = 10) => {
  const cacheKey = `admin_payouts_${status}_${page}_${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const { skip } = parsePagination(String(page), String(limit));
  const where = status ? { status } : {};

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      skip,
      take: limit,
      orderBy: { requestedAt: 'desc' },
      include: {
        pic: {
          select: { fullName: true, email: true, upiId: true, bankAccountNumber: true, ifscCode: true },
        },
      },
    }),
    prisma.payout.count({ where }),
  ]);

  const result = { payouts, total };
  cacheSet(cacheKey, result);
  return result;
};

/**
 * Mark payout as paid
 */
export const markPayoutPaid = async (payoutId: string, adminId: string, transactionRef?: string) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: { pic: { select: { fullName: true, email: true } } },
  });
  if (!payout) throw createError('Payout not found', 404);
  if (payout.status === PayoutStatus.PAID) throw createError('Payout already marked as paid', 400);

  await prisma.$transaction(async (tx) => {
    await tx.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.PAID, processedAt: new Date(), transactionRef },
    });

    // ✅ CORRECT wallet update on mark-paid:
    // - availableBalance was ALREADY decremented when the PIC submitted the request
    //   (in pic.service.ts requestPayout). Do NOT decrement it again here.
    // - pendingEarnings was incremented on request — now move it to paidEarnings.
    await tx.wallet.update({
      where: { picId: payout.picId },
      data: {
        pendingEarnings: { decrement: payout.amount }, // clear from pending
        paidEarnings: { increment: payout.amount },    // move to paid
        // availableBalance: already deducted at request time — do NOT touch it here
      },
    });

    await tx.notification.create({
      data: {
        picId: payout.picId,
        type: 'PAYOUT_COMPLETED',
        title: 'Payout Processed!',
        message: `Your payout of ₹${payout.amount.toFixed(2)} has been processed.`,
        metadata: { amount: payout.amount, transactionRef },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId, actorRole: 'ADMIN',
        action: 'MARK_PAYOUT_PAID', targetId: payoutId, targetType: 'Payout',
        metadata: { amount: payout.amount, transactionRef },
      },
    });
  });

  sendPayoutEmail(payout.pic.email, payout.pic.fullName, payout.amount).catch(console.error);
  return { message: 'Payout marked as paid' };
};

/**
 * Save / update Shopify settings (encrypted)
 */
export const saveShopifySettings = async (settings: {
  storeName: string;
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  webhookSecret: string;
}) => {
  const encrypted = {
    storeName: settings.storeName,
    storeUrl: settings.storeUrl,
    apiKey: encrypt(settings.apiKey),
    apiSecret: encrypt(settings.apiSecret),
    accessToken: encrypt(settings.accessToken),
    webhookSecret: encrypt(settings.webhookSecret),
    isActive: true,
  };

  const existing = await prisma.shopifySettings.findFirst();
  if (existing) {
    return prisma.shopifySettings.update({ where: { id: existing.id }, data: encrypted });
  }
  return prisma.shopifySettings.create({ data: encrypted });
};

/**
 * Get Shopify settings (decrypted for display — mask sensitive values)
 */
export const getShopifySettings = async () => {
  const settings = await prisma.shopifySettings.findFirst();
  if (!settings) return null;

  return {
    id: settings.id,
    storeName: settings.storeName,
    storeUrl: settings.storeUrl,
    apiKey: settings.apiKey ? '****' + decrypt(settings.apiKey).slice(-4) : null,
    isActive: settings.isActive,
    updatedAt: settings.updatedAt,
  };
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (page = 1, limit = 20) => {
  const { skip } = parsePagination(String(page), String(limit));
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count(),
  ]);
  return { logs, total };
};

/**
 * Get commission summary
 */
export const getCommissionSummary = async () => {
  const [pending, paid, total] = await Promise.all([
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PROCESSING' } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true } }),
  ]);

  return {
    pendingCommission: pending._sum.commissionAmount || 0,
    paidCommission: paid._sum.commissionAmount || 0,
    totalCommission: total._sum.commissionAmount || 0,
  };
};

// ─────────────────────────────────────────────────
// ANNOUNCEMENT SERVICES
// ─────────────────────────────────────────────────

/**
 * Get all active announcements (for PICs) or all announcements (for admins)
 */
export const getAnnouncements = async (activeOnly = false) => {
  return prisma.announcement.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
    },
  });
};

/**
 * Create an announcement (admin only)
 */
export const createAnnouncement = async (
  adminId: string,
  data: { title: string; content: string; isActive?: boolean }
) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      isActive: data.isActive ?? true,
      authorId: adminId,
    },
    include: {
      author: { select: { name: true } },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'CREATE_ANNOUNCEMENT',
      targetId: announcement.id,
      targetType: 'Announcement',
      metadata: { title: data.title, isActive: announcement.isActive },
    },
  }).catch(() => {}); // non-blocking

  return announcement;
};

/**
 * Update an announcement (admin only)
 */
export const updateAnnouncement = async (
  id: string,
  data: { title?: string; content?: string; isActive?: boolean }
) => {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw createError('Announcement not found', 404);
  return prisma.announcement.update({
    where: { id },
    data,
    include: { author: { select: { name: true } } },
  });
};

/**
 * Delete an announcement (admin only)
 */
export const deleteAnnouncement = async (id: string, adminId?: string) => {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw createError('Announcement not found', 404);
  await prisma.announcement.delete({ where: { id } });

  if (adminId) {
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'DELETE_ANNOUNCEMENT',
        targetId: id,
        targetType: 'Announcement',
        metadata: { title: announcement.title },
      },
    }).catch(() => {});
  }

  return { message: 'Announcement deleted successfully' };
};

// ─────────────────────────────────────────────────
// NOTIFICATION SERVICES
// ─────────────────────────────────────────────────

/**
 * Get notifications for a PIC
 */
export const getPICNotifications = async (picId: string, page = 1, limit = 20) => {
  const { skip } = parsePagination(String(page), String(limit));
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { picId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { picId } }),
    prisma.notification.count({ where: { picId, isRead: false } }),
  ]);
  return { notifications, total, unreadCount };
};

/**
 * Mark all notifications as read for a PIC
 */
export const markAllNotificationsRead = async (picId: string) => {
  await prisma.notification.updateMany({
    where: { picId, isRead: false },
    data: { isRead: true },
  });
  return { message: 'All notifications marked as read' };
};

// ─────────────────────────────────────────────────
// POLICIES & LEGAL COMPLIANCE
// ─────────────────────────────────────────────────

export const getPolicies = async () => {
  return prisma.policyDocument.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const uploadPolicy = async (data: { title: string, type: any, version: string, isRequired: boolean, fileUrl: string }) => {
  // If a policy of this type already exists, update it. Otherwise create it.
  const existing = await prisma.policyDocument.findUnique({
    where: { type: data.type }
  });

  if (existing) {
    return prisma.policyDocument.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        version: data.version,
        isRequired: data.isRequired,
        fileUrl: data.fileUrl
      }
    });
  }

  return prisma.policyDocument.create({
    data
  });
};

export const resetPolicyAcceptance = async () => {
  const result = await prisma.pICPartner.updateMany({
    where: { status: 'ACTIVE' },
    data: { isPolicyAccepted: false }
  });
  return { updatedCount: result.count };
};

export const getPICPolicyLogs = async (picId: string) => {
  return prisma.policyAcceptanceLog.findMany({
    where: { picId },
    include: {
      document: true
    },
    orderBy: { acceptedAt: 'desc' }
  });
};

export const getAllPolicyLogs = async () => {
  return prisma.policyAcceptanceLog.findMany({
    include: {
      document: true,
      pic: {
        select: { fullName: true, email: true, phone: true }
      }
    },
    orderBy: { acceptedAt: 'desc' }
  });
};

export const resetPICPassword = async (picId: string, newPassword: string, adminId: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) {
    throw createError(404, 'PIC not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.pICPartner.update({
    where: { id: picId },
    data: { password: hashedPassword }
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'RESET_PIC_PASSWORD',
      details: `Admin reset password for PIC: ${pic.email}`
    }
  });

  return { message: 'Password reset successfully' };
};
