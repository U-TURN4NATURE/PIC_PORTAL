import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// ─────────────────────────────────────────────────
// Upload Middleware — Multer configuration
// ─────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'docs');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_DOC_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_RESUME_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'resumeDocument') {
    if (ALLOWED_RESUME_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Resume must be PDF, DOC, or DOCX'));
    }
  } else {
    // aadhaarDocument, panDocument
    if (ALLOWED_DOC_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Documents must be PDF, JPG, JPEG, or PNG'));
    }
  }
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'resumeDocument', maxCount: 1 },
]);
