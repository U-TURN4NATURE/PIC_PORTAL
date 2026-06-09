import prisma from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { PICStatus, PayoutStatus } from '@prisma/client';
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

/**
 * Get dashboard analytics
 */
export const getDashboardStats = async () => {
  const [
    totalPICs,
    activePICs,
    pendingPICs,
    rejectedPICs,
    totalOrders,
    paidOrders,
    totalRevenue,
    totalCommission,
    recentPICs,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.pICPartner.count(),
    prisma.pICPartner.count({ where: { status: { in: [PICStatus.APPROVED, PICStatus.ACTIVE] } } }),
    prisma.pICPartner.count({ where: { status: PICStatus.PENDING } }),
    prisma.pICPartner.count({ where: { status: PICStatus.REJECTED } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { orderAmount: true }, where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true }, where: { status: 'PAID' } }),
    prisma.pICPartner.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, status: true, createdAt: true },
    }),
    // Monthly revenue for the last 6 months
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
  ]);

  return {
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
    recentPICs,
    monthlyRevenue,
  };
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

  return { pics, total };
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

  return { orders, total };
};

/**
 * Get all payouts
 */
export const getAllPayouts = async (status?: PayoutStatus, page = 1, limit = 10) => {
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

  return { payouts, total };
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
