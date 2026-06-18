import { redirect } from 'next/navigation';

/**
 * /admin — redirects to the dashboard (which itself redirects to /admin/login if not authenticated).
 */
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
