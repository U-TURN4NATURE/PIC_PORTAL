import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://picportal-production-a624.up.railway.app/api',
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
