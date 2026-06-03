import { Router } from 'express';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';
import {
  handleGetAllFollowUps,
  handleUpdateFollowUp,
  handleGetOpenCount,
} from './followup.controller';

const router = Router();

router.use(protect, restrictToAdmin);

// GET /api/admin/followups — All follow-up requests
router.get('/', handleGetAllFollowUps);

// GET /api/admin/followups/count — Open count for badge
router.get('/count', handleGetOpenCount);

// PATCH /api/admin/followups/:id — Update status + notes
router.patch('/:id', handleUpdateFollowUp);

export default router;
