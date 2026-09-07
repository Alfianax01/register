import { notFound } from 'next/navigation';

// URL /admin tidak boleh menampilkan dashboard dan wajib 404
export default function AdminPage() {
  notFound();
}
