import { Router } from 'express';
import { protect, restrictToAdmin } from '../../middleware/auth.middleware';
import {
  getAllContent,
  getSection,
  updateSection,
  addItem,
  updateItem,
  deleteItem,
} from './content.controller';

const router = Router();

// ─────────────────────────────────────────────────
// PUBLIC ROUTES — Website reads content from here
// ─────────────────────────────────────────────────

// GET /api/content — Get all content
router.get('/', getAllContent);

// GET /api/content/:section — Get specific section (testimonials, faqs, etc.)
router.get('/:section', getSection);

// ─────────────────────────────────────────────────
// ADMIN ONLY ROUTES — CMS Portal uses these
// ─────────────────────────────────────────────────

// PUT /api/content/:section — Replace entire section (hero, contact, stats)
router.put('/:section', protect, restrictToAdmin, updateSection);

// POST /api/content/:section/item — Add item to array section
router.post('/:section/item', protect, restrictToAdmin, addItem);

// PUT /api/content/:section/item/:id — Update specific item
router.put('/:section/item/:id', protect, restrictToAdmin, updateItem);

// DELETE /api/content/:section/item/:id — Delete specific item
router.delete('/:section/item/:id', protect, restrictToAdmin, deleteItem);

export default router;
