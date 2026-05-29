import { Router } from 'express';
import * as walletController from './wallet.controller';
import { protect, restrictToPIC } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

router.use(protect, restrictToPIC);

const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(500, 'Minimum withdrawal amount is ₹500'),
    paymentMethod: z.enum(['UPI', 'BANK_TRANSFER']).optional().default('UPI'),
  }),
});

router.get('/', walletController.getWalletBalance);
router.post('/withdraw', validate(withdrawalSchema), walletController.requestWithdrawal);
router.get('/history', walletController.getPayoutHistory);

export default router;
