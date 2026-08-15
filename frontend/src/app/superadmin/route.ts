import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /superadmin
 * Serves the standalone CMS admin portal HTML file.
 * Only accessible to admin users (protect with auth if needed).
 */
export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'superadmin.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Prevent indexing by search engines
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
