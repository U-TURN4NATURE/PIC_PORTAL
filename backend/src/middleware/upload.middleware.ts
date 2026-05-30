import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────
// Upload Middleware — Local (dev) or Cloudinary (prod)
// ─────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production';

let storage: multer.StorageEngine;

if (isProduction) {
  // ── Cloudinary Storage (Production) ─────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req: any, file: Express.Multer.File) => {
      const isDocument =
        file.mimetype === 'application/pdf' ||
        file.mimetype.includes('msword') ||
        file.mimetype.includes('officedocument');

      return {
        folder: 'pic-portal/docs',
        resource_type: isDocument ? 'raw' : 'image',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
        public_id: `${file.fieldname}-${Date.now()}`,
      };
    },
  }) as unknown as multer.StorageEngine;

} else {
  // ── Local Disk Storage (Development) ────────────
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'docs');
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
  });
}

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const RESUME_TYPES = ['.pdf', '.doc', '.docx'];
  const DOC_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];

  if (file.fieldname === 'resumeDocument') {
    if (RESUME_TYPES.includes(ext)) return cb(null, true);
    return cb(new Error('Resume must be PDF, DOC, or DOCX'));
  }
  if (DOC_TYPES.includes(ext)) return cb(null, true);
  return cb(new Error('Documents must be PDF, JPG, JPEG, or PNG'));
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).fields([
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'resumeDocument', maxCount: 1 },
]);
