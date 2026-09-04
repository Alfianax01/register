import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">TNI Event Pass</span>
          <span>&bull;</span>
          <span>Sistem Manajemen Kehadiran & E-Ticket Resmi</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Gedung Ahmad Yani, Mabes TNI Cilangkap</span>
          <span>&bull;</span>
          <Link href="/admin/login" className="text-slate-600 hover:text-slate-900 font-medium">
            Panel Petugas
          </Link>
        </div>
      </div>
    </footer>
  );
};
