import { Router } from 'express';
import * as picController from './pic.controller';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all PIC routes
router.use(protect, restrictToPIC);

// Dashboard
router.get('/dashboard', picController.getDashboardStats);
router.get('/referral', picController.getReferralInfo);

// Orders
router.get('/orders', picController.getOrders);

// Wallet
router.get('/wallet', picController.getWallet);

// Payouts
router.get('/payouts', picController.getPayouts);
router.post('/payouts', picController.requestPayout);

// Profile
router.patch('/profile', picController.updateProfile);
router.post('/accept-policy', picController.acceptPolicy);

// Policy Document — protected: only ACTIVE PICs can access
router.get('/policy-document', picController.getPolicyDocument);

export default router;
