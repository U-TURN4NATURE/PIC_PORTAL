import { Router } from 'express';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';
import {
  handleAddReferral,
  handleGetPICReferrals,
  handleGetPICReferralStats,
} from './referral.controller';

const router = Router();

// All routes require PIC authentication
router.use(protect, restrictToPIC);

// POST /api/pic/referrals — PIC adds a new referral
router.post('/', handleAddReferral);

// GET /api/pic/referrals — PIC gets their own referrals
router.get('/', handleGetPICReferrals);

// GET /api/pic/referrals/stats — PIC gets referral stats
router.get('/stats', handleGetPICReferralStats);

export default router;
