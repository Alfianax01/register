'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  QrCode,
  Armchair,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AdminSidebarProps {
  userRole?: string;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userRole, onLogout }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin/scanner',
      label: 'Scanner Gate',
      icon: QrCode,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE']
    },
    {
      href: '/admin/placement',
      label: 'Penempatan Kursi & Wisma',
      icon: Armchair,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/monitoring',
      label: 'Monitoring Real-Time',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/guests',
      label: 'Master Data Tamu',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI']
    }
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <Shield className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-900 block leading-tight">
            Portal Panitia
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            RAPIM TNI 2026
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Menu Admin" className="p-3 space-y-1 flex-1">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1 block">
          Menu Operasional
        </span>

        {menuItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href === '/admin/scanner' && pathname === '/admin/checkin');
          const isAllowed = !userRole || item.allowedRoles.includes(userRole);

          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-slate-100 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Portal Publik</span>
          </span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        )}
      </div>
    </aside>
  );
};
