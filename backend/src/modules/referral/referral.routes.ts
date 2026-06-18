import { Router } from 'express';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';
import {
  handleAddReferral,
  handleBulkAddReferrals,
  handleUpdateHandledBy,
  handleUpdateReferralStatusForPIC,
  handleGetPICReferrals,
  handleGetPICReferralStats,
} from './referral.controller';

const router = Router();

// All routes require PIC authentication
router.use(protect, restrictToPIC);

// POST /api/pic/referrals — PIC adds a new referral
router.post('/', handleAddReferral);

// POST /api/pic/referrals/bulk — PIC bulk uploads referrals
router.post('/bulk', handleBulkAddReferrals);

// PATCH /api/pic/referrals/:id/handled-by — PIC updates handledBy
router.patch('/:id/handled-by', handleUpdateHandledBy);

// PATCH /api/pic/referrals/:id/status — PIC updates referral status
router.patch('/:id/status', handleUpdateReferralStatusForPIC);

// GET /api/pic/referrals — PIC gets their own referrals
router.get('/', handleGetPICReferrals);

// GET /api/pic/referrals/stats — PIC gets referral stats
router.get('/stats', handleGetPICReferralStats);

export default router;
