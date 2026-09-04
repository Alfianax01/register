'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import {
  QrCode,
  Armchair,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AdminSidebarProps {
  userRole?: string;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userRole, onLogout }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin/checkin',
      label: 'Scanner Check-In',
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
    <aside className="w-64 bg-[#07130D] border-r border-[#1B382B] flex flex-col flex-shrink-0 min-h-screen">
      {/* Header Badge */}
      <div className="p-5 border-b border-[#1A382A]">
        <div className="flex items-center gap-3">
          <TniEmblem matra="MABES" size="sm" />
          <div>
            <span className="text-[10px] text-[#D4AF37] font-bold tracking-wider uppercase block">
              PANITIA PENYELENGGARA
            </span>
            <h2 className="text-xs font-serif font-bold text-slate-100">
              RAPIM TNI 2026
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1.5 flex-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-3 pt-2 pb-1 block">
          Menu Operasional
        </span>

        {menuItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const isAllowed = !userRole || item.allowedRoles.includes(userRole);

          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-[#153D2B] text-[#F5E296] font-semibold border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-300 hover:bg-[#0D2217] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-[#1A382A] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-[#0D2217] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Portal Publik</span>
          </span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        )}
      </div>
    </aside>
  );
};

