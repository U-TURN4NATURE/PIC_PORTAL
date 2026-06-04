import { Request, Response } from 'express';
import {
  addReferral,
  getPICReferrals,
  getPICReferralStats,
  getAdminReferralsByPIC,
  getAllReferrals,
  updateReferralStatus,
  updateReferralSales,
  getSaleHistory,
  updateSaleEntry,
} from './referral.service';
import { ReferralStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// PIC Controllers
// ─────────────────────────────────────────────────

export const handleAddReferral = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const data = await addReferral(picId, req.body);
  res.status(201).json({ success: true, data });
};

export const handleGetPICReferrals = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const { status, page, limit } = req.query;
  const data = await getPICReferrals(
    picId,
    status as ReferralStatus | undefined,
    Number(page) || 1,
    Number(limit) || 20
  );
  res.json({ success: true, ...data });
};

export const handleGetPICReferralStats = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const data = await getPICReferralStats(picId);
  res.json({ success: true, data });
};

// ─────────────────────────────────────────────────
// Admin Controllers
// ─────────────────────────────────────────────────

export const handleGetAllReferrals = async (req: Request, res: Response): Promise<void> => {
  const { status, page, limit } = req.query;
  const data = await getAllReferrals(
    status as ReferralStatus | undefined,
    Number(page) || 1,
    Number(limit) || 20
  );
  res.json({ success: true, ...data });
};

export const handleGetReferralsByPIC = async (req: Request, res: Response): Promise<void> => {
  const { picId } = req.params;
  const { page, limit } = req.query;
  const data = await getAdminReferralsByPIC(picId, Number(page) || 1, Number(limit) || 20);
  res.json({ success: true, ...data });
};

export const handleUpdateReferralStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const data = await updateReferralStatus(id, status as ReferralStatus, adminNotes);
  res.json({ success: true, data });
};

export const handleUpdateReferralSales = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { salesAmount, commissionRate } = req.body;
  const data = await updateReferralSales(id, Number(salesAmount), commissionRate ? Number(commissionRate) : undefined);
  res.json({ success: true, data });
};

export const handleGetSaleHistory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await getSaleHistory(id);
  res.json({ success: true, data });
};

export const handleUpdateSaleEntry = async (req: Request, res: Response): Promise<void> => {
  const { saleId } = req.params;
  const { saleAmount, commissionRate } = req.body;
  const data = await updateSaleEntry(saleId, {
    saleAmount: saleAmount ? Number(saleAmount) : undefined,
    commissionRate: commissionRate ? Number(commissionRate) : undefined
  });
  res.json({ success: true, data });
};
