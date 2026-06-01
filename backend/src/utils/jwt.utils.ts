import jwt from 'jsonwebtoken';

// ─────────────────────────────────────────────────
// JWT Utility Functions
// ─────────────────────────────────────────────────

export interface JWTPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'PIC';
}

/**
 * Generate a signed JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
};

/**
 * Get cookie options for HTTP-only JWT cookie
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: true, // Must be true for SameSite=None
  sameSite: 'none' as const, // Required for cross-domain cookies (Vercel <-> Railway)
  maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000, // days to ms
  path: '/',
});
