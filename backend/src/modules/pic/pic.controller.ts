import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import * as picService from './pic.service';
import { successResponse, buildPaginationMeta, errorResponse } from '../../utils/pagination.utils';
import prisma from '../../config/database';

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

/**
 * GET /pic/policy-document
 * Streams the confidential PIC policy PDF.
 * Only accessible to authenticated PICs whose account status is ACTIVE.
 * The file is stored in backend/src/assets/ and is NOT in the public folder.
 */
export const getPolicyDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Double-check the PIC is ACTIVE in the database (JWT alone is not enough)
    const pic = await prisma.pIC.findUnique({
      where: { id: req.user!.id },
      select: { status: true },
    });

    if (!pic || pic.status !== 'ACTIVE') {
      res.status(403).json(errorResponse('Access denied. Only approved PICs can view the policy document.'));
      return;
    }

    const pdfPath = path.resolve(__dirname, '../../assets/policy.pdf');

    if (!fs.existsSync(pdfPath)) {
      res.status(404).json(errorResponse('Policy document not found. Please contact support.'));
      return;
    }

    // Serve the PDF inline (for viewing in iframe) — no download, no cache
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="PIC-Policy-Document.pdf"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
