import { Request, Response, NextFunction } from 'express';
import * as walletService from './wallet.service';
import { successResponse, buildPaginationMeta } from '../../utils/pagination.utils';

export const getWalletBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await walletService.getWalletBalance(req.user!.id);
    res.status(200).json(successResponse(balance));
  } catch (error) {
    next(error);
  }
};

export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.requestWithdrawal(req.user!.id, req.body.amount, req.body.paymentMethod);
    res.status(201).json(successResponse(result, 'Withdrawal request submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPayoutHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const { payouts, total } = await walletService.getPayoutHistory(req.user!.id, Number(page) || 1, Number(limit) || 10);
    const meta = buildPaginationMeta(total, Number(page) || 1, Number(limit) || 10);
    res.status(200).json(successResponse(payouts, 'Success', meta));
  } catch (error) {
    next(error);
  }
};
