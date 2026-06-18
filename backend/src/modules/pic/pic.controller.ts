import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import * as picService from './pic.service';
import { successResponse, buildPaginationMeta, errorResponse } from '../../utils/pagination.utils';
import prisma from '../../config/database';
import * as adminService from '../admin/admin.service';

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
    const pic = await prisma.pICPartner.findUnique({
      where: { id: req.user!.id },
      select: { status: true },
    });

    if (!pic || pic.status !== 'ACTIVE') {
      res.status(403).json(errorResponse('Access denied. Only approved PICs can view the policy document.'));
      return;
    }

    const pdfPath = path.resolve(process.cwd(), 'dist', 'assets', 'policy.pdf');
    // In development (ts-node), fall back to src/assets
    const devPath = path.resolve(process.cwd(), 'src', 'assets', 'policy.pdf');
    const resolvedPath = fs.existsSync(pdfPath) ? pdfPath : devPath;

    if (!fs.existsSync(resolvedPath)) {
      res.status(404).json(errorResponse('Policy document not found. Please contact support.'));
      return;
    }

    // Serve the PDF inline (for viewing in iframe) — no download, no cache
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="PIC-Policy-Document.pdf"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /pic/announcements
 * Returns only active announcements, visible to all authenticated PICs.
 */
export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await adminService.getAnnouncements(true); // activeOnly = true
    res.status(200).json(successResponse(announcements));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /pic/notifications
 * Returns notifications for the logged-in PIC with unread count.
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getPICNotifications(req.user!.id, Number(page) || 1, Number(limit) || 20);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /pic/notifications/mark-read
 * Marks all notifications as read for the logged-in PIC.
 */
export const markNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.markAllNotificationsRead(req.user!.id);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /pic/profile/avatar
 * Upload or replace profile image.
 * Accepts multipart/form-data with field: profileImage
 */
export const uploadProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    // In production, Cloudinary returns req.file.path as the secure URL
    // In development, we get a local file path — build a server-relative URL
    const isProduction = process.env.NODE_ENV === 'production';
    let imageUrl: string;

    if (isProduction) {
      imageUrl = (req.file as any).path; // Cloudinary URL (Cloudinary handles optimization)
    } else {
      // Optimize local image using sharp to save storage
      // Read into buffer first to prevent Windows EBUSY file lock errors when unlinking
      const fileBuffer = fs.readFileSync(req.file.path);
      const optimizedFilename = `optimized-${req.file.filename.split('.')[0]}.webp`;
      const optimizedPath = path.join(req.file.destination, optimizedFilename);

      // Dynamically require sharp (dev only) — avoids platform binary mismatch on deploy
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
      const sharp: any = require('sharp');
      await sharp(fileBuffer)
        .resize(500, 500, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(optimizedPath);

      // Delete the original uploaded file safely
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Failed to delete original temp image:', err);
      }

      // Serve via /uploads static route
      const relativePath = optimizedPath.replace(/\\/g, '/').split('uploads/').pop();
      imageUrl = `/uploads/${relativePath}`;
    }

    const pic = await picService.uploadProfileImage(req.user!.id, imageUrl);
    res.status(200).json(successResponse(pic, 'Profile image updated successfully'));
  } catch (error) {
    next(error);
  }
};

