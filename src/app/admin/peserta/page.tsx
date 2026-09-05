import { redirect } from 'next/navigation';

export default function AdminPesertaRedirectPage() {
  redirect('/admin/guests');
}

