import { Router } from 'express';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';
import { handleCreateFollowUp, handleGetPICFollowUps } from './followup.controller';

const router = Router();

router.use(protect, restrictToPIC);

// POST /api/pic/referrals/:referralId/followup — Request a follow-up for a referral
router.post('/:referralId/followup', handleCreateFollowUp);

// GET /api/pic/followups — PIC views their own follow-up requests
router.get('/', handleGetPICFollowUps);

export default router;
