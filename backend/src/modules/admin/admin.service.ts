import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { createError } from '../../middleware/error.middleware';
import { PICStatus, PayoutStatus, Prisma } from '@prisma/client';
import { generateReferralCode, generateResetToken } from '../../utils/crypto.utils';
import { encrypt, decrypt } from '../../utils/crypto.utils';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPayoutEmail,
  sendPasswordResetEmail,
} from '../../services/email.service';
import { generateOTP } from '../../utils/crypto.utils';
import { parsePagination } from '../../utils/pagination.utils';
import ExcelJS from 'exceljs';

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

/**
 * Export all PICs to an Excel file with personal details
 */
export const exportPICsToExcel = async () => {
  const pics = await prisma.pICPartner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      wallet: true,
      _count: { select: { orders: true, referrals: true } },
    }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'U-Turn4Nature Admin';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('PIC Partners');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 25 },
    { header: 'Full Name', key: 'fullName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Pincode', key: 'pincode', width: 15 },
    { header: 'Aadhaar Number', key: 'aadhaarNumber', width: 20 },
    { header: 'PAN Card', key: 'panCard', width: 15 },
    { header: 'Bank Account Name', key: 'bankAccountName', width: 25 },
    { header: 'Bank Name', key: 'bankName', width: 25 },
    { header: 'Account Number', key: 'bankAccountNumber', width: 25 },
    { header: 'IFSC Code', key: 'ifscCode', width: 15 },
    { header: 'Branch Name', key: 'branchName', width: 20 },
    { header: 'UPI ID', key: 'upiId', width: 25 },
    { header: 'Occupation', key: 'occupation', width: 20 },
    { header: 'Years of Experience', key: 'yearsOfExperience', width: 20 },
    { header: 'Skills', key: 'skills', width: 30 },
    { header: 'Education', key: 'education', width: 25 },
    { header: 'Preferred Working Area', key: 'preferredWorkingArea', width: 25 },
    { header: 'Preferred District', key: 'preferredDistrict', width: 20 },
    { header: 'Availability', key: 'availability', width: 15 },
    { header: 'Why Join', key: 'whyJoin', width: 40 },
    { header: 'Instagram', key: 'instagramProfile', width: 25 },
    { header: 'Facebook', key: 'facebookProfile', width: 25 },
    { header: 'LinkedIn', key: 'linkedinProfile', width: 25 },
    { header: 'Email Verified', key: 'isEmailVerified', width: 15 },
    { header: 'Policy Accepted', key: 'isPolicyAccepted', width: 15 },
    { header: 'Profile Completed', key: 'profileCompleted', width: 15 },
    { header: 'Referral Code', key: 'referralCode', width: 15 },
    { header: 'Total Earnings', key: 'totalEarnings', width: 15 },
    { header: 'Total Orders', key: 'totalOrders', width: 15 },
    { header: 'Total Referrals', key: 'totalReferrals', width: 15 },
    { header: 'Joined At', key: 'createdAt', width: 20 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  pics.forEach(pic => {
    worksheet.addRow({
      id: pic.id,
      fullName: pic.fullName,
      email: pic.email,
      phone: pic.phone,
      status: pic.status,
      address: pic.address,
      city: pic.city,
      state: pic.state,
      pincode: pic.pincode,
      aadhaarNumber: pic.aadhaarNumber || 'N/A',
      panCard: pic.panCard || 'N/A',
      bankAccountName: pic.bankAccountName || 'N/A',
      bankName: pic.bankName || 'N/A',
      bankAccountNumber: pic.bankAccountNumber || 'N/A',
      ifscCode: pic.ifscCode || 'N/A',
      branchName: pic.branchName || 'N/A',
      upiId: pic.upiId || 'N/A',
      occupation: pic.occupation || 'N/A',
      yearsOfExperience: pic.yearsOfExperience || 'N/A',
      skills: pic.skills || 'N/A',
      education: pic.education || 'N/A',
      preferredWorkingArea: pic.preferredWorkingArea || 'N/A',
      preferredDistrict: pic.preferredDistrict || 'N/A',
      availability: pic.availability || 'N/A',
      whyJoin: pic.whyJoin || 'N/A',
      instagramProfile: pic.instagramProfile || 'N/A',
      facebookProfile: pic.facebookProfile || 'N/A',
      linkedinProfile: pic.linkedinProfile || 'N/A',
      isEmailVerified: pic.isEmailVerified ? 'Yes' : 'No',
      isPolicyAccepted: pic.isPolicyAccepted ? 'Yes' : 'No',
      profileCompleted: pic.profileCompleted ? 'Yes' : 'No',
      referralCode: pic.referralCode || 'N/A',
      totalEarnings: pic.wallet?.totalEarnings || 0,
      totalOrders: pic._count?.orders || 0,
      totalReferrals: pic._count?.referrals || 0,
      createdAt: new Date(pic.createdAt).toLocaleDateString('en-IN')
    });
  });

  return workbook;
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
 * Unsuspend a PIC — restores to ACTIVE
 */
export const unsuspendPIC = async (picId: string, adminId: string, reason?: string) => {
  const pic = await prisma.pICPartner.findUnique({ where: { id: picId } });
  if (!pic) throw createError('PIC not found', 404);
  if (pic.status !== PICStatus.SUSPENDED) throw createError('PIC is not suspended', 400);

  await prisma.$transaction(async (tx) => {
    await tx.pICPartner.update({ where: { id: picId }, data: { status: PICStatus.ACTIVE } });
    await tx.notification.create({
      data: {
        picId,
        type: 'SYSTEM',
        title: 'Account Reinstated',
        message: reason || 'Your account suspension has been lifted. You can now access the PIC dashboard again.',
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: adminId, actorRole: 'ADMIN',
        action: 'UNSUSPEND_PIC', targetId: picId, targetType: 'PICPartner',
        metadata: { reason },
      },
    });
  });

  return { message: 'PIC unsuspended successfully' };
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

export const deletePolicy = async (policyId: string) => {
  const policy = await prisma.policyDocument.findUnique({
    where: { id: policyId }
  });
  if (!policy) throw createError('Policy not found', 404);
  
  await prisma.policyDocument.delete({
    where: { id: policyId }
  });
  return { success: true, message: 'Policy deleted successfully' };
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
    throw createError('PIC not found', 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Set mustChangePassword = true so PIC is forced to change on next login
  await prisma.pICPartner.update({
    where: { id: picId },
    data: { password: hashedPassword, mustChangePassword: true }
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'RESET_PIC_PASSWORD',
      targetId: picId,
      targetType: 'PICPartner',
      metadata: { details: `Admin set temporary password for PIC: ${pic.email}` }
    }
  });

  return { message: 'Temporary password set successfully. PIC will be prompted to change it on next login.' };
};

// ─────────────────────────────────────────────────
// Password Reset Request Management
// ─────────────────────────────────────────────────

/**
 * Get all password reset requests for admin
 */
export const getPasswordResetRequests = async (status?: string) => {
  const where = status && status !== 'all' ? { status: status as any } : {};

  const requests = await prisma.passwordResetRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      pic: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          profileImage: true,
        },
      },
    },
  });

  const pendingCount = await prisma.passwordResetRequest.count({ where: { status: 'PENDING' } });

  return { requests, pendingCount };
};

/**
 * Admin approves a password reset request and sets a temporary password manually
 */
export const approvePasswordResetRequest = async (requestId: string, adminId: string, tempPassword: string, adminNote?: string) => {
  const request = await prisma.passwordResetRequest.findUnique({
    where: { id: requestId },
    include: { pic: true },
  });

  if (!request) throw createError('Request not found', 404);
  if (request.status !== 'PENDING') throw createError('This request has already been processed', 400);

  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Update the request status
  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      adminNote: adminNote || null,
    },
  });

  // Update the PIC's password to the temporary password
  await prisma.pICPartner.update({
    where: { id: request.picId },
    data: {
      password: hashedPassword,
      mustChangePassword: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'APPROVE_PASSWORD_RESET_REQUEST',
      targetId: request.picId,
      targetType: 'PICPartner',
      metadata: { requestId, details: `Admin approved password reset and set temp password for ${request.pic.email}` },
    },
  });

  return { message: `Temporary password set for ${request.pic.email}. Please share it securely with them.` };
};

/**
 * Admin rejects a password reset request
 */
export const rejectPasswordResetRequest = async (requestId: string, adminId: string, adminNote?: string) => {
  const request = await prisma.passwordResetRequest.findUnique({
    where: { id: requestId },
    include: { pic: true },
  });

  if (!request) throw createError('Request not found', 404);
  if (request.status !== 'PENDING') throw createError('This request has already been processed', 400);

  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', adminNote: adminNote || null },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'REJECT_PASSWORD_RESET_REQUEST',
      targetId: request.picId,
      targetType: 'PICPartner',
      metadata: { requestId, details: `Admin rejected password reset for ${request.pic.email}` },
    },
  });

  return { message: 'Password reset request rejected.' };
};
