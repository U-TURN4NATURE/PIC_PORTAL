import { Request, Response } from 'express';
import {
  createFollowUpRequest,
  getPICFollowUpRequests,
  getAllFollowUpRequests,
  updateFollowUpRequest,
  getOpenFollowUpCount,
} from './followup.service';
import { FollowUpStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// PIC Controllers
// ─────────────────────────────────────────────────

export const handleCreateFollowUp = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const { referralId } = req.params;
  const data = await createFollowUpRequest(picId, referralId, req.body);
  res.status(201).json({ success: true, data });
};

export const handleGetPICFollowUps = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const { page, limit } = req.query;
  const data = await getPICFollowUpRequests(picId, Number(page) || 1, Number(limit) || 20);
  res.json({ success: true, ...data });
};

// ─────────────────────────────────────────────────
// Admin Controllers
// ─────────────────────────────────────────────────

export const handleGetAllFollowUps = async (req: Request, res: Response): Promise<void> => {
  const { status, priority, page, limit } = req.query;
  const data = await getAllFollowUpRequests(
    status as FollowUpStatus | undefined,
    priority as string | undefined,
    Number(page) || 1,
    Number(limit) || 20
  );
  res.json({ success: true, ...data });
};

export const handleUpdateFollowUp = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const data = await updateFollowUpRequest(id, status as FollowUpStatus, adminNotes);
  res.json({ success: true, data });
};

export const handleGetOpenCount = async (req: Request, res: Response): Promise<void> => {
  const count = await getOpenFollowUpCount();
  res.json({ success: true, data: { count } });
};
