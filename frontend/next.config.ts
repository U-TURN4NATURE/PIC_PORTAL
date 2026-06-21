import type { NextConfig } from "next";
import path from "path";

const RAILWAY_BACKEND = 'https://picportal-production-a624.up.railway.app';

const nextConfig: NextConfig = {
  experimental: {},
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Proxy all /api/* requests to Railway backend
  // This fixes cross-origin issues on ALL mobile browsers (Brave, iOS Safari, etc.)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${RAILWAY_BACKEND}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clevup.in',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picportal-production-a624.up.railway.app',
      },
    ],
  },
};

export default nextConfig;

