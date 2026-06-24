import { Request, Response, NextFunction } from 'express';
import {
  addReferral,
  addBulkReferrals,
  updateReferralHandledBy,
  updateReferralEmail,
  getPICReferrals,
  getPICReferralStats,
  getAdminReferralsByPIC,
  getAllReferrals,
  updateReferralStatus,
  updateReferralSales,
  getSaleHistory,
  updateSaleEntry,
  deleteSaleEntry,
} from './referral.service';
import { ReferralStatus, HandledBy } from '@prisma/client';

// ─────────────────────────────────────────────────
// PIC Controllers
// ─────────────────────────────────────────────────

export const handleAddReferral = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const data = await addReferral(picId, req.body);
  res.status(201).json({ success: true, data });
};

export const handleBulkAddReferrals = async (req: Request, res: Response): Promise<void> => {
  const picId = (req as any).user.id;
  const { referrals } = req.body;
  if (!Array.isArray(referrals)) {
    res.status(400).json({ success: false, message: 'Invalid payload format' });
    return;
  }
  const result = await addBulkReferrals(picId, referrals);
  res.status(201).json({ success: true, count: result.count });
};

export const handleUpdateHandledBy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { handledBy } = req.body;
  const data = await updateReferralHandledBy(id, handledBy as HandledBy);
  res.json({ success: true, data });
};

export const handleUpdateReferralEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const picId = (req as any).user.id;
    const { id } = req.params;
    const { personEmail } = req.body;
    const data = await updateReferralEmail(picId, id, personEmail || null);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateReferralStatusForPIC = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  // Passing undefined for adminNotes since PICs shouldn't overwrite admin notes directly here
  const data = await updateReferralStatus(id, status as ReferralStatus, undefined);
  res.json({ success: true, data });
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

export const handleUpdateSaleEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params;
    const { saleAmount, commissionRate } = req.body;
    const result = await updateSaleEntry(saleId, { saleAmount, commissionRate });
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteSaleEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params;
    const result = await deleteSaleEntry(saleId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
