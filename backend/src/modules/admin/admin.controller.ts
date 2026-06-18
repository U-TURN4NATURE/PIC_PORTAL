import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { successResponse, buildPaginationMeta } from '../../utils/pagination.utils';
import { PICStatus, PayoutStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};

export const getPICs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, page, limit } = req.query;
    const { pics, total } = await adminService.getAllPICs(
      search as string,
      status as PICStatus,
      Number(page) || 1,
      Number(limit) || 10
    );
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 10);
    res.status(200).json(successResponse(pics, 'Success', meta));
  } catch (error) {
    next(error);
  }
};

export const getPICById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pic = await adminService.getPICById(req.params.id);
    res.status(200).json(successResponse(pic));
  } catch (error) {
    next(error);
  }
};

export const getBankApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approvals = await adminService.getBankApprovals();
    res.status(200).json(successResponse(approvals));
  } catch (error) {
    next(error);
  }
};

export const approveBankDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.approveBankDetails(req.params.id);
    res.status(200).json(successResponse(result, 'Bank details approved successfully'));
  } catch (error) {
    next(error);
  }
};

export const rejectBankDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.rejectBankDetails(req.params.id);
    res.status(200).json(successResponse(result, 'Bank details request rejected'));
  } catch (error) {
    next(error);
  }
};

export const approvePIC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.approvePIC(req.params.id, req.user!.id);
    res.status(200).json(successResponse(result, 'PIC approved successfully'));
  } catch (error) {
    next(error);
  }
};

export const rejectPIC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.rejectPIC(req.params.id, req.user!.id, req.body.reason);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

export const suspendPIC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.suspendPIC(req.params.id, req.user!.id, req.body.reason);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

export const deletePIC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deletePIC(req.params.id, req.user!.id);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { picId, status, startDate, endDate, page, limit } = req.query;
    const { orders, total } = await adminService.getAllOrders(
      picId as string,
      status as string,
      startDate as string,
      endDate as string,
      Number(page) || 1,
      Number(limit) || 10
    );
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 10);
    res.status(200).json(successResponse(orders, 'Success', meta));
  } catch (error) {
    next(error);
  }
};

export const getPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = req.query;
    const { payouts, total } = await adminService.getAllPayouts(
      status as PayoutStatus,
      Number(page) || 1,
      Number(limit) || 10
    );
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 10);
    res.status(200).json(successResponse(payouts, 'Success', meta));
  } catch (error) {
    next(error);
  }
};

export const markPayoutPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.markPayoutPaid(req.params.id, req.user!.id, req.body.transactionRef);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

export const getShopifySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getShopifySettings();
    res.status(200).json(successResponse(settings));
  } catch (error) {
    next(error);
  }
};

export const saveShopifySettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.saveShopifySettings(req.body);
    res.status(200).json(successResponse(result, 'Settings saved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const { logs, total } = await adminService.getAuditLogs(Number(page) || 1, Number(limit) || 20);
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 20);
    res.status(200).json(successResponse(logs, 'Success', meta));
  } catch (error) {
    next(error);
  }
};

export const getCommissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await adminService.getCommissionSummary();
    res.status(200).json(successResponse(summary));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// ANNOUNCEMENT CONTROLLERS
// ─────────────────────────────────────────────────

export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await adminService.getAnnouncements(false);
    res.status(200).json(successResponse(announcements));
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, isActive } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }
    const announcement = await adminService.createAnnouncement(req.user!.id, { title, content, isActive });
    res.status(201).json(successResponse(announcement, 'Announcement created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await adminService.updateAnnouncement(req.params.id, req.body);
    res.status(200).json(successResponse(announcement, 'Announcement updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteAnnouncement(req.params.id, req.user!.id);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// NOTIFICATION CONTROLLERS
// ─────────────────────────────────────────────────

export const getPICNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin endpoint: get notifications for a specific PIC
    const { picId } = req.params;
    const { page, limit } = req.query;
    const result = await adminService.getPICNotifications(picId, Number(page) || 1, Number(limit) || 20);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

