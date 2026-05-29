import prisma from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { PayoutStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// Wallet Service — Business Logic
// ─────────────────────────────────────────────────

export const getWalletBalance = async (picId: string) => {
  const wallet = await prisma.wallet.findUnique({ where: { picId } });
  if (!wallet) throw createError('Wallet not found', 404);
  return wallet;
};

export const requestWithdrawal = async (picId: string, amount: number, paymentMethod = 'UPI') => {
  // Validate minimum amount (e.g. ₹500)
  if (amount < 500) {
    throw createError('Minimum withdrawal amount is ₹500', 400);
  }

  const pic = await prisma.pICPartner.findUnique({
    where: { id: picId },
    include: { wallet: true },
  });

  if (!pic || !pic.wallet) throw createError('Wallet not found', 404);

  // Check if bank details are complete
  if (!pic.upiId && (!pic.bankAccountNumber || !pic.ifscCode)) {
    throw createError('Please complete your payment details (UPI or Bank Account) in your profile before requesting a withdrawal', 400);
  }

  // Check sufficient balance
  if (pic.wallet.availableBalance < amount) {
    throw createError(`Insufficient balance. Available: ₹${pic.wallet.availableBalance.toFixed(2)}`, 400);
  }

  // Create payout request and update wallet in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Deduct from available balance, but keep in totalEarnings
    // (We do not add to paidEarnings until admin approves)
    await tx.wallet.update({
      where: { picId },
      data: {
        availableBalance: { decrement: amount },
        pendingEarnings: { increment: amount }, // Moving to pending state
      },
    });

    const payout = await tx.payout.create({
      data: {
        picId,
        amount,
        paymentMethod,
        status: PayoutStatus.PENDING,
      },
    });

    // Notify admin
    await tx.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'New Payout Request',
        message: `${pic.fullName} has requested a payout of ₹${amount.toFixed(2)}.`,
      },
    });

    return payout;
  });

  return result;
};

export const getPayoutHistory = async (picId: string, page = 1, limit = 10) => {
  const { skip } = parsePagination(String(page), String(limit));

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where: { picId },
      skip,
      take: limit,
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.payout.count({ where: { picId } }),
  ]);

  return { payouts, total };
};
