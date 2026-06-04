import prisma from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { ReferralStatus } from '@prisma/client';
import { parsePagination } from '../../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Referral Service — Business Logic
// ─────────────────────────────────────────────────

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '5.0');

/**
 * PIC adds a new referral (person they have referred)
 */
export const addReferral = async (
  picId: string,
  data: { personName: string; personPhone: string; personEmail?: string }
) => {
  // Block duplicate phone under same PIC
  const existing = await prisma.referral.findUnique({
    where: { picId_personPhone: { picId, personPhone: data.personPhone } },
  });
  if (existing) {
    throw createError('You have already added a referral with this phone number', 400);
  }

  return prisma.referral.create({
    data: {
      picId,
      personName: data.personName,
      personPhone: data.personPhone,
      personEmail: data.personEmail || null,
      commissionRate: COMMISSION_RATE,
    },
  });
};

/**
 * PIC fetches their own referrals with optional status filter
 */
export const getPICReferrals = async (
  picId: string,
  status?: ReferralStatus,
  page = 1,
  limit = 20
) => {
  const { skip } = parsePagination(String(page), String(limit));
  const where = { picId, ...(status && { status }) };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        followUpRequests: {
          select: { id: true, status: true, priority: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  return { referrals, total };
};

/**
 * Admin fetches all referrals for a specific PIC
 */
export const getAdminReferralsByPIC = async (picId: string, page = 1, limit = 20) => {
  const { skip } = parsePagination(String(page), String(limit));

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where: { picId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        followUpRequests: {
          select: { id: true, status: true, priority: true, reason: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.referral.count({ where: { picId } }),
  ]);

  return { referrals, total };
};

/**
 * Admin fetches all referrals across all PICs
 */
export const getAllReferrals = async (
  status?: ReferralStatus,
  page = 1,
  limit = 20
) => {
  const { skip } = parsePagination(String(page), String(limit));
  const where = status ? { status } : {};

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        pic: { select: { id: true, fullName: true, email: true, referralCode: true } },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  return { referrals, total };
};

/**
 * Admin updates the status of a referral
 */
export const updateReferralStatus = async (
  referralId: string,
  status: ReferralStatus,
  adminNotes?: string
) => {
  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral) throw createError('Referral not found', 404);

  return prisma.referral.update({
    where: { id: referralId },
    data: {
      status,
      adminNotes: adminNotes ?? referral.adminNotes,
      statusUpdatedAt: new Date(),
    },
  });
};

/**
 * Admin manually enters a sale for a referral → auto-credits PIC wallet
 */
export const updateReferralSales = async (
  referralId: string,
  salesAmount: number,
  commissionRate?: number
) => {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: { pic: { select: { id: true } } },
  });
  if (!referral) throw createError('Referral not found', 404);

  const rate = commissionRate ?? referral.commissionRate;
  const newCommission = (salesAmount * rate) / 100;
  const newTotalSales = referral.totalSalesAmount + salesAmount;
  const newTotalCommission = referral.commissionAmount + newCommission;

  await prisma.$transaction(async (tx) => {
    // Update the referral's sales figures
    await tx.referral.update({
      where: { id: referralId },
      data: {
        totalSalesAmount: newTotalSales,
        commissionAmount: newTotalCommission,
        commissionRate: rate,
        status: ReferralStatus.BUYING,
        statusUpdatedAt: new Date(),
      },
    });

    // Create the SaleEntry
    await tx.saleEntry.create({
      data: {
        referralId: referralId,
        picId: referral.picId,
        saleAmount: salesAmount,
        commissionRate: rate,
        commissionEarned: newCommission,
      }
    });

    // Credit commission directly to PIC wallet
    await tx.wallet.update({
      where: { picId: referral.picId },
      data: {
        totalEarnings: { increment: newCommission },
        availableBalance: { increment: newCommission },
      },
    });

    // Notify the PIC
    await tx.notification.create({
      data: {
        picId: referral.picId,
        type: 'NEW_COMMISSION',
        title: 'New Commission Earned! 🎉',
        message: `You earned ₹${newCommission.toFixed(2)} commission for referral: ${referral.personName}.`,
        metadata: { referralId, salesAmount, commission: newCommission },
      },
    });
  });

  return {
    referralId,
    personName: referral.personName,
    salesAmount,
    commissionEarned: newCommission,
    newTotalSales,
    newTotalCommission,
  };
};

/**
 * Get the history of sales entries for a referral
 */
export const getSaleHistory = async (referralId: string) => {
  return await prisma.saleEntry.findMany({
    where: { referralId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Modify a past sale entry safely, recalculating the wallet balances and totals.
 */
export const updateSaleEntry = async (saleId: string, updates: { saleAmount?: number; commissionRate?: number }) => {
  const sale = await prisma.saleEntry.findUnique({ where: { id: saleId }, include: { referral: true } });
  if (!sale) throw createError('Sale entry not found', 404);

  const newAmount = updates.saleAmount ?? sale.saleAmount;
  const newRate = updates.commissionRate ?? sale.commissionRate;
  const newCommission = (newAmount * newRate) / 100;

  const commissionDiff = newCommission - sale.commissionEarned;
  const salesDiff = newAmount - sale.saleAmount;

  await prisma.$transaction(async (tx) => {
    // 1. Update the sale entry itself
    await tx.saleEntry.update({
      where: { id: saleId },
      data: {
        saleAmount: newAmount,
        commissionRate: newRate,
        commissionEarned: newCommission,
      }
    });

    // 2. Adjust Referral Totals
    await tx.referral.update({
      where: { id: sale.referralId },
      data: {
        totalSalesAmount: { increment: salesDiff },
        commissionAmount: { increment: commissionDiff },
      }
    });

    // 3. Adjust PIC Wallet Balance
    await tx.wallet.update({
      where: { picId: sale.picId },
      data: {
        totalEarnings: { increment: commissionDiff },
        availableBalance: { increment: commissionDiff },
      }
    });
  });

  return { message: 'Sale updated successfully', commissionDiff };
};

/**
 * Delete a past sale entry safely, subtracting the commission from wallet and totals.
 */
export const deleteSaleEntry = async (saleId: string) => {
  const sale = await prisma.saleEntry.findUnique({ where: { id: saleId }, include: { referral: true } });
  if (!sale) throw createError('Sale entry not found', 404);

  await prisma.$transaction(async (tx) => {
    // 1. Delete the sale entry
    await tx.saleEntry.delete({
      where: { id: saleId },
    });

    // 2. Subtract from referral totals
    await tx.referral.update({
      where: { id: sale.referralId },
      data: {
        totalSalesAmount: { decrement: sale.saleAmount },
        commissionAmount: { decrement: sale.commissionEarned },
      }
    });

    // 3. Subtract from PIC wallet balance
    await tx.wallet.update({
      where: { picId: sale.picId },
      data: {
        totalEarnings: { decrement: sale.commissionEarned },
        availableBalance: { decrement: sale.commissionEarned },
      }
    });
  });

  return { message: 'Sale entry deleted successfully' };
};

/**
 * PIC dashboard referral stats
 */
export const getPICReferralStats = async (picId: string) => {
  const [total, statusCounts, commissionResult] = await Promise.all([
    prisma.referral.count({ where: { picId } }),
    prisma.referral.groupBy({
      by: ['status'],
      where: { picId },
      _count: { status: true },
    }),
    prisma.referral.aggregate({
      where: { picId },
      _sum: { commissionAmount: true, totalSalesAmount: true },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => {
    statusMap[s.status] = s._count.status;
  });

  return {
    total,
    statusBreakdown: statusMap,
    totalSales: commissionResult._sum.totalSalesAmount ?? 0,
    totalCommission: commissionResult._sum.commissionAmount ?? 0,
  };
};
