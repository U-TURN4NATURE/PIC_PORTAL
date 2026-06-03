import prisma from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { FollowUpStatus } from '@prisma/client';
import { parsePagination } from '../../utils/pagination.utils';

// ─────────────────────────────────────────────────
// Follow-Up Request Service
// ─────────────────────────────────────────────────

/**
 * PIC creates a follow-up request for one of their referrals
 */
export const createFollowUpRequest = async (
  picId: string,
  referralId: string,
  data: { reason: string; priority?: string }
) => {
  // Verify the referral belongs to this PIC
  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral) throw createError('Referral not found', 404);
  if (referral.picId !== picId) throw createError('Unauthorized', 403);

  // Check if there's already an OPEN request for this referral
  const openRequest = await prisma.followUpRequest.findFirst({
    where: { referralId, status: FollowUpStatus.OPEN },
  });
  if (openRequest) {
    throw createError('A follow-up request is already open for this referral', 400);
  }

  return prisma.followUpRequest.create({
    data: {
      picId,
      referralId,
      reason: data.reason,
      priority: data.priority || 'NORMAL',
    },
  });
};

/**
 * PIC views status of their own follow-up requests
 */
export const getPICFollowUpRequests = async (picId: string, page = 1, limit = 20) => {
  const { skip } = parsePagination(String(page), String(limit));

  const [requests, total] = await Promise.all([
    prisma.followUpRequest.findMany({
      where: { picId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        referral: {
          select: { personName: true, personPhone: true, personEmail: true, status: true },
        },
      },
    }),
    prisma.followUpRequest.count({ where: { picId } }),
  ]);

  return { requests, total };
};

/**
 * Admin fetches all follow-up requests with filters
 */
export const getAllFollowUpRequests = async (
  status?: FollowUpStatus,
  priority?: string,
  page = 1,
  limit = 20
) => {
  const { skip } = parsePagination(String(page), String(limit));
  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [requests, total] = await Promise.all([
    prisma.followUpRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        pic: { select: { id: true, fullName: true, email: true, phone: true } },
        referral: {
          select: { personName: true, personPhone: true, personEmail: true, status: true },
        },
      },
    }),
    prisma.followUpRequest.count({ where }),
  ]);

  // Count open requests for badge
  const openCount = await prisma.followUpRequest.count({
    where: { status: FollowUpStatus.OPEN },
  });

  return { requests, total, openCount };
};

/**
 * Admin updates the status of a follow-up request
 */
export const updateFollowUpRequest = async (
  requestId: string,
  status: FollowUpStatus,
  adminNotes?: string
) => {
  const request = await prisma.followUpRequest.findUnique({ where: { id: requestId } });
  if (!request) throw createError('Follow-up request not found', 404);

  const isDone = status === FollowUpStatus.DONE || status === FollowUpStatus.DISMISSED;

  const updated = await prisma.followUpRequest.update({
    where: { id: requestId },
    data: {
      status,
      adminNotes: adminNotes ?? request.adminNotes,
      resolvedAt: isDone ? new Date() : null,
    },
  });

  // Notify PIC when done
  if (isDone) {
    await prisma.notification.create({
      data: {
        picId: request.picId,
        type: 'SYSTEM',
        title: status === FollowUpStatus.DONE ? 'Follow-up Completed ✓' : 'Follow-up Dismissed',
        message:
          status === FollowUpStatus.DONE
            ? 'Admin has completed the follow-up you requested. Check your referrals for updates.'
            : 'Admin has dismissed your follow-up request. Contact support if you have questions.',
        metadata: { followUpRequestId: requestId },
      },
    });
  }

  return updated;
};

/**
 * Get open follow-up count for admin badge
 */
export const getOpenFollowUpCount = async () => {
  return prisma.followUpRequest.count({ where: { status: FollowUpStatus.OPEN } });
};
