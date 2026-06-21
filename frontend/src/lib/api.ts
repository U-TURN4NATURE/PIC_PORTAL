import axios from 'axios';

const PRODUCTION_API_URL = '/api'; // Proxied via Vercel rewrites → Railway (no CORS issues)
const LOCAL_API_URL = 'http://localhost:5000/api';

const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

export const getFileUrl = (filePath: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  const baseUrl = isProduction ? 'https://picportal-production-a624.up.railway.app' : 'http://localhost:5000';
  return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

const api = axios.create({
  baseURL: isProduction ? PRODUCTION_API_URL : LOCAL_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token from localStorage as Bearer header ──
// This fixes mobile login (iOS Safari blocks cross-domain cookies by default)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch {
      // Silently ignore localStorage errors
    }
  }
  return config;
});

// ── Response interceptor: handle 401 Unauthorized globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith('/admin');
        const isAuthPage =
          currentPath === '/login' ||
          currentPath === '/admin/login' ||
          currentPath.startsWith('/register');

        if (!isAuthPage) {
          window.location.href = isAdminRoute ? '/admin/login' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data.data ?? res.data);
export default api;
