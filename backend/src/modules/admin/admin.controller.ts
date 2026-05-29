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
