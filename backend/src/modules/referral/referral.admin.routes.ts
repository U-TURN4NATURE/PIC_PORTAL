import { Router } from 'express';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';
import {
  handleGetAllReferrals,
  handleGetReferralsByPIC,
  handleUpdateReferralStatus,
  handleUpdateReferralSales,
  handleGetSaleHistory,
  handleUpdateSaleEntry,
} from './referral.controller';

const router = Router();

// All routes require Admin authentication
router.use(protect, restrictToAdmin);

// GET /api/admin/referrals — All referrals across all PICs
router.get('/', handleGetAllReferrals);

// GET /api/admin/referrals/pic/:picId — All referrals for a specific PIC
router.get('/pic/:picId', handleGetReferralsByPIC);

// PATCH /api/admin/referrals/:id/status — Update referral status
router.patch('/:id/status', handleUpdateReferralStatus);

// PATCH /api/admin/referrals/:id/sales — Manually enter sale amount
router.patch('/:id/sales', handleUpdateReferralSales);
router.get('/:id/sales/history', handleGetSaleHistory);
router.patch('/sales/:saleId', handleUpdateSaleEntry);

export default router;
