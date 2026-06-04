import axios from 'axios';

const PRODUCTION_API_URL = 'https://picportal-production-a624.up.railway.app/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

export const getFileUrl = (filePath: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  const baseUrl = isProduction ? 'https://picportal-production-a624.up.railway.app' : 'http://localhost:5000';
  return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

// Force the correct Railway URL in production, ignoring any potentially incorrect Vercel env vars
const api = axios.create({
  baseURL: isProduction ? PRODUCTION_API_URL : LOCAL_API_URL,
  withCredentials: true, // Crucial for sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle global 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith('/admin');

        // Don't redirect if already on a login/register page
        const isAuthPage =
          currentPath === '/login' ||
          currentPath === '/admin/login' ||
          currentPath.startsWith('/register');

        if (!isAuthPage) {
          // Redirect admin routes to admin login, PIC routes to PIC login
          window.location.href = isAdminRoute ? '/admin/login' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
