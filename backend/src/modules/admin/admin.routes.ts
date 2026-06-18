import { Router } from 'express';
import * as adminController from './admin.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all admin routes
router.use(protect, restrictToAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// PIC Management
router.get('/pics', adminController.getPICs);
router.get('/pics/:id', adminController.getPICById);
router.patch('/pics/:id/approve', adminController.approvePIC);
router.patch('/pics/:id/reject', adminController.rejectPIC);
router.patch('/pics/:id/suspend', adminController.suspendPIC);
router.delete('/pics/:id', adminController.deletePIC);

// ─────────────────────────────────────────────────
// BANK DETAILS APPROVALS
// ─────────────────────────────────────────────────
router.get('/bank-approvals', adminController.getBankApprovals);
router.post('/bank-approvals/:id/approve', adminController.approveBankDetails);
router.post('/bank-approvals/:id/reject', adminController.rejectBankDetails);

// Orders & Payouts
router.get('/orders', adminController.getOrders);
router.get('/payouts', adminController.getPayouts);
router.patch('/payouts/:id/mark-paid', adminController.markPayoutPaid);
router.get('/commissions', adminController.getCommissions);

// Settings & Logs
router.get('/shopify/settings', adminController.getShopifySettings);
router.post('/shopify/settings', adminController.saveShopifySettings);
router.get('/audit-logs', adminController.getAuditLogs);

// Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.patch('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

export default router;

