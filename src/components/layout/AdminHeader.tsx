'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Menu } from 'lucide-react';
import { useAdmin } from './AdminContext';

interface AdminHeaderProps {
  user?: {
    nama: string;
    role: string;
    username: string;
  } | null;
  title: string;
  subtitle?: string;
  onToggleDrawer?: () => void;
  children?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user: propUser,
  title,
  subtitle,
  onToggleDrawer,
  children
}) => {
  const adminCtx = useAdmin();
  const user = propUser !== undefined ? propUser : adminCtx?.currentUser;
  const handleToggle = onToggleDrawer || adminCtx?.toggleDrawer;

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
    <header className="min-h-16 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {handleToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="lg:hidden w-11 h-11 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Buka Navigasi Admin"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium leading-none mt-1 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {children}

        {user && (
          <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-semibold text-slate-900 block leading-tight truncate max-w-[160px]">
                {user.nama}
              </span>
              <span className="text-xs text-slate-500 font-mono leading-none">
                @{user.username}
              </span>
            </div>
            {getRoleBadge(user.role)}
          </div>
        )}
      </div>
    </header>
  );
};
