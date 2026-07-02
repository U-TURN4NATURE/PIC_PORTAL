import { Router } from 'express';
import * as adminController from './admin.controller';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all admin routes
router.use(protect, restrictToAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// PIC Management
router.get('/export-pics', adminController.exportPICs);
router.get('/pics', adminController.getPICs);
router.get('/pics/:id', adminController.getPICById);
router.get('/pics/:id/policy-logs', adminController.getPICPolicyLogs);
router.patch('/pics/:id/approve', adminController.approvePIC);
router.patch('/pics/:id/reject', adminController.rejectPIC);
router.patch('/pics/:id/suspend', adminController.suspendPIC);
router.patch('/pics/:id/unsuspend', adminController.unsuspendPIC);
router.post('/pics/:id/reset-password', adminController.resetPICPassword);
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

// Policies
import upload from '../../middleware/upload.middleware';
router.get('/policies', adminController.getPolicies);
router.get('/policies/logs', adminController.getAllPolicyLogs);
router.post('/policies/upload', upload.single('document'), adminController.uploadPolicy);
router.post('/policies/reset-acceptance', adminController.resetPolicyAcceptance);
router.delete('/policies/:id', adminController.deletePolicy);

// ─────────────────────────────────────────────────
// PASSWORD RESET REQUESTS
// ─────────────────────────────────────────────────
router.get('/password-reset-requests', adminController.getPasswordResetRequests);
router.post('/password-reset-requests/:id/approve', adminController.approvePasswordResetRequest);
router.post('/password-reset-requests/:id/reject', adminController.rejectPasswordResetRequest);

export default router;


