import { Request, Response, NextFunction } from 'express';
import * as picService from './pic.service';
import { successResponse, buildPaginationMeta } from '../../utils/pagination.utils';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await picService.getDashboardStats(req.user!.id);
    res.status(200).json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};

export const getReferralInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const info = await picService.getReferralInfo(req.user!.id);
    res.status(200).json(successResponse(info));
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const { orders, total } = await picService.getOrders(req.user!.id, Number(page) || 1, Number(limit) || 10);
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 10);
    res.status(200).json(successResponse(orders, 'Success', meta));
  } catch (error) {
    next(error);
  }
};

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await picService.getWallet(req.user!.id);
    res.status(200).json(successResponse(wallet));
  } catch (error) {
    next(error);
  }
};

export const getPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payouts = await picService.getPayouts(req.user!.id);
    res.status(200).json(successResponse(payouts));
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payout = await picService.requestPayout(req.user!.id, req.body);
    res.status(201).json(successResponse(payout, 'Payout request submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pic = await picService.updateProfile(req.user!.id, req.body);
    res.status(200).json(successResponse(pic, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const acceptPolicy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pic = await picService.acceptPolicy(req.user!.id);
    res.status(200).json(successResponse(pic, 'Policy accepted successfully'));
  } catch (error) {
    next(error);
  }
};
