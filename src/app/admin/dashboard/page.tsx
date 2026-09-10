import { redirect } from 'next/navigation';

export default function AdminDashboardRedirectPage() {
  redirect('/admin');
  redirect('/admin/guests');
}

