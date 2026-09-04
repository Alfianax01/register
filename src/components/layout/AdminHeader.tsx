'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Shield, Bell, UserCircle } from 'lucide-react';

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
        return <Badge variant="gold" size="sm">SUPER ADMIN</Badge>;
      case 'PANITIA_GATE':
        return <Badge variant="ad" size="sm">PETUGAS GATE</Badge>;
      case 'PANITIA_AKOMODASI':
        return <Badge variant="al" size="sm">PETUGAS AKOMODASI</Badge>;
      default:
        return <Badge variant="slate" size="sm">PANITIA</Badge>;
    }
  };

  return (
    <header className="h-20 bg-[#091811] border-b border-[#1B382B] px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>{title}</span>
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-[#1A382A]">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-200 block">{user.nama}</span>
              <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
            </div>
            {getRoleBadge(user.role)}
          </div>
        )}
      </div>
    </header>
  );
};

