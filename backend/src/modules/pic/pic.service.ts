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

  if (!wallet) throw createError('Wallet not found', 404);

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
    prisma.order.findMany({
      where: { picId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { picId } }),
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
  const allowedFields = ['phone', 'address', 'state', 'city', 'pincode', 'upiId', 'bankAccountNumber', 'ifscCode', 'instagramProfile'];
  const updateData: any = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  const pic = await prisma.pICPartner.update({
    where: { id: picId },
    data: updateData,
    select: {
      id: true, fullName: true, phone: true, address: true,
      state: true, city: true, pincode: true,
      upiId: true, bankAccountNumber: true, ifscCode: true,
      instagramProfile: true,
    }
  });

  return pic;
};
