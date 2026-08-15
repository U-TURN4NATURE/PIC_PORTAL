import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const CONTENT_FILE = path.join(__dirname, 'content.json');

// ─────────────────────────────────────────────────
// Helper: Read content file
// ─────────────────────────────────────────────────
const readContent = (): Record<string, unknown> => {
  const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
  return JSON.parse(raw);
};

// ─────────────────────────────────────────────────
// Helper: Write content file
// ─────────────────────────────────────────────────
const writeContent = (data: Record<string, unknown>): void => {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// ─────────────────────────────────────────────────
// GET /api/content — Get all content (public)
// ─────────────────────────────────────────────────
export const getAllContent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// GET /api/content/:section — Get specific section (public)
// ─────────────────────────────────────────────────
export const getSection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    const section = content[req.params.section];
    if (section === undefined) {
      res.status(404).json({ success: false, message: `Section '${req.params.section}' not found` });
      return;
    }
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// PUT /api/content/:section — Replace entire section (admin only)
// ─────────────────────────────────────────────────
export const updateSection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    content[req.params.section] = req.body;
    writeContent(content);
    res.status(200).json({ success: true, message: 'Section updated successfully', data: req.body });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// POST /api/content/:section/item — Add item to array section (admin only)
// ─────────────────────────────────────────────────
export const addItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    const section = content[req.params.section];

    if (!Array.isArray(section)) {
      res.status(400).json({ success: false, message: `Section '${req.params.section}' is not an array` });
      return;
    }

    const newItem = {
      ...req.body,
      id: `${req.params.section[0]}${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    (section as unknown[]).push(newItem);
    writeContent(content);
    res.status(201).json({ success: true, message: 'Item added successfully', data: newItem });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// PUT /api/content/:section/item/:id — Update item in array (admin only)
// ─────────────────────────────────────────────────
export const updateItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    const section = content[req.params.section];

    if (!Array.isArray(section)) {
      res.status(400).json({ success: false, message: `Section '${req.params.section}' is not an array` });
      return;
    }

    const idx = (section as { id: string }[]).findIndex(item => item.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    (section as Record<string, unknown>[])[idx] = { ...(section as Record<string, unknown>[])[idx], ...req.body };
    writeContent(content);
    res.status(200).json({ success: true, message: 'Item updated successfully', data: (section as Record<string, unknown>[])[idx] });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// DELETE /api/content/:section/item/:id — Delete item from array (admin only)
// ─────────────────────────────────────────────────
export const deleteItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const content = readContent();
    const section = content[req.params.section];

    if (!Array.isArray(section)) {
      res.status(400).json({ success: false, message: `Section '${req.params.section}' is not an array` });
      return;
    }

    const filtered = (section as { id: string }[]).filter(item => item.id !== req.params.id);

    if (filtered.length === section.length) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    content[req.params.section] = filtered;
    writeContent(content);
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
