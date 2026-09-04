'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Shield } from 'lucide-react';

interface AdminHeaderProps {
  user: {
    nama: string;
    role: string;
    username: string;
  } | null;
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, title, subtitle }) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge variant="primary" size="sm">Super Admin</Badge>;
      case 'PANITIA_GATE':
        return <Badge variant="success" size="sm">Petugas Gate</Badge>;
      case 'PANITIA_AKOMODASI':
        return <Badge variant="slate" size="sm">Petugas Akomodasi</Badge>;
      default:
        return <Badge variant="slate" size="sm">Panitia</Badge>;
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && <p className="text-[11px] text-slate-500 leading-none mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-slate-900 block leading-tight">{user.nama}</span>
              <span className="text-[10px] text-slate-500 font-mono leading-none">@{user.username}</span>
            </div>
            {getRoleBadge(user.role)}
          </div>
        )}
      </div>
    </header>
  );
};
