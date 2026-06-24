import { Router } from 'express';
import * as picController from './pic.controller';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';
import { profileImageUpload } from '../../middleware/upload.middleware';

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
router.post('/profile/avatar', profileImageUpload, picController.uploadProfileImage);
router.post('/accept-policy', picController.acceptPolicy);

// Policy Document — protected: only ACTIVE PICs can access
router.get('/policy-document', picController.getPolicyDocument);
router.get('/policies', picController.getActivePolicies);

// Announcements — read-only for PICs
router.get('/announcements', picController.getAnnouncements);

// Notifications
router.get('/notifications', picController.getNotifications);
router.post('/notifications/mark-read', picController.markNotificationsRead);

export default router;
