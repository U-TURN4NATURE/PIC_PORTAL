import prisma from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { PayoutStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// PIC Service — Business Logic for Partner Portal
// ─────────────────────────────────────────────────

export const getDashboardStats = async (picId: string) => {
  const [wallet, totalOrders, recentOrders] = await Promise.all([
    prisma.wallet.findUnique({ where: { picId } }),
    prisma.order.count({ where: { picId } }),
    prisma.order.findMany({
      where: { picId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shopifyOrderId: true,
        shopifyOrderNum: true,
        orderAmount: true,
        commissionAmount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  if (!wallet) {
    // APPROVED users may not have a wallet yet — return zeroed stats
    return {
      wallet: { totalEarnings: 0, pendingEarnings: 0, paidEarnings: 0, availableBalance: 0 },
      totalOrders,
      recentOrders,
    };
  }

  return {
    wallet,
    totalOrders,
    recentOrders,
  };
};

export const getReferralInfo = async (picId: string) => {
  const pic = await prisma.pICPartner.findUnique({
    where: { id: picId },
    select: { referralCode: true },
  });

  if (!pic || !pic.referralCode) {
    throw createError('Referral code not found or account not approved yet', 400);
  }

  const referralLink = `${process.env.REFERRAL_BASE_URL || 'https://uturn4nature.com'}/?ref=${pic.referralCode}`;

  // Stats for referral page
  const [totalOrders, commissionResult] = await Promise.all([
    prisma.order.count({ where: { picId } }),
    prisma.order.aggregate({
      where: { picId },
      _sum: { commissionAmount: true },
    }),
  ]);

  return {
    referralCode: pic.referralCode,
    referralLink,
    stats: {
      totalOrders,
      totalCommission: commissionResult._sum.commissionAmount || 0,
    },
  };
};

export const getOrders = async (picId: string, page = 1, limit = 10) => {
  const { skip } = parsePagination(String(page), String(limit));

  const [orders, total] = await Promise.all([
    prisma.saleEntry.findMany({
      where: { picId },
      include: { referral: { select: { personName: true, personEmail: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.saleEntry.count({ where: { picId } }),
  ]);

  return { orders, total };
};

export const getWallet = async (picId: string) => {
  const wallet = await prisma.wallet.findUnique({ where: { picId } });
  if (!wallet) throw createError('Wallet not found', 404);
  return wallet;
};

export const getPayouts = async (picId: string) => {
  const payouts = await prisma.payout.findMany({
    where: { picId },
    orderBy: { requestedAt: 'desc' },
  });
  return payouts;
};

export const requestPayout = async (picId: string, data: { amount: number; paymentMethod: string; notes?: string }) => {
  const wallet = await prisma.wallet.findUnique({ where: { picId } });
  if (!wallet) throw createError('Wallet not found', 404);

  if (data.amount < 500) throw createError('Minimum withdrawal amount is ₹500', 400);
  if (data.amount > wallet.availableBalance) throw createError('Amount exceeds available balance', 400);

  // Deduct from available balance
  const [payout] = await prisma.$transaction([
    prisma.payout.create({
      data: {
        picId,
        amount: data.amount,
        paymentMethod: data.paymentMethod || 'UPI',
        notes: data.notes,
        status: PayoutStatus.PENDING,
      },
    }),
    prisma.wallet.update({
      where: { picId },
      data: {
        availableBalance: { decrement: data.amount },
        pendingEarnings: { increment: data.amount },
      },
    }),
  ]);

  return payout;
};

export const updateProfile = async (picId: string, data: any) => {
  const allowedFields = ['phone', 'address', 'state', 'city', 'pincode', 'instagramProfile'];
  const bankFields = ['upiId', 'bankAccountNumber', 'ifscCode', 'bankAccountName', 'bankName', 'branchName'];

  const updateData: any = {};
  const pendingBankData: any = {};
  let hasPendingBankData = false;

  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  for (const field of bankFields) {
    if (data[field] !== undefined) {
      pendingBankData[field] = data[field];
      hasPendingBankData = true;
    }
  }

  if (hasPendingBankData) {
    updateData.pendingBankDetails = pendingBankData;
  }

  const pic = await prisma.pICPartner.update({
    where: { id: picId },
    data: updateData,
    select: {
      id: true, fullName: true, email: true, phone: true, profileImage: true,
      address: true, state: true, city: true, pincode: true,
      upiId: true, bankAccountNumber: true, ifscCode: true, instagramProfile: true,
      pendingBankDetails: true,
    },
  });

  return pic;
};

export const acceptPolicy = async (picId: string, ipAddress?: string, userAgent?: string) => {
  // Find all current active/required policies to log them
  const activePolicies = await prisma.policyDocument.findMany({
    where: { isRequired: true }
  });

  const acceptanceLogs = activePolicies.map(doc => ({
    picId,
    documentId: doc.id,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  }));

  const pic = await prisma.$transaction(async (tx) => {
    if (acceptanceLogs.length > 0) {
      await tx.policyAcceptanceLog.createMany({
        data: acceptanceLogs
      });
    }

    return tx.pICPartner.update({
      where: { id: picId },
      data: { isPolicyAccepted: true },
      select: {
        id: true,
        isPolicyAccepted: true,
      },
    });
  });

  return pic;
};

// Also expose a function to get current policies
export const getActivePolicies = async () => {
  return prisma.policyDocument.findMany({
    where: { isRequired: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const uploadProfileImage = async (picId: string, imageUrl: string) => {
  const pic = await prisma.pICPartner.update({
    where: { id: picId },
    data: { profileImage: imageUrl },
    select: { id: true, profileImage: true },
  });
  return pic;
};
