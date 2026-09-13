'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  Armchair,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  X,
  ClipboardCheck,
  Settings
} from 'lucide-react';
import { useAdmin } from './AdminContext';

interface AdminSidebarProps {
  userRole?: string;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole,
  onLogout,
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const pathname = usePathname();
  const adminCtx = useAdmin();

  const isOpen = propIsOpen !== undefined ? propIsOpen : adminCtx?.isDrawerOpen ?? false;
  const handleClose = propOnClose || adminCtx?.closeDrawer || (() => {});
  const effectiveRole = userRole || adminCtx?.currentUser?.role;

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      allowedRoles: ['SUPER_ADMIN', 'admin', 'superadmin', 'PANITIA_GATE', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/guests',
      label: 'Data Peserta',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN', 'admin', 'superadmin']
    },
    {
      href: '/admin/allocation',
      label: 'Penempatan Kursi & Wisma',
      icon: Armchair,
      allowedRoles: ['SUPER_ADMIN', 'admin', 'superadmin', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/scanner',
      label: 'Scan QR Gate',
      icon: QrCode,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE', 'admin', 'superadmin']
    },
    {
      href: '/admin/monitoring',
      label: 'Monitoring Presensi',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN', 'admin', 'superadmin']
    },
    {
      href: '/admin/website',
      label: 'Manajemen Website',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN', 'admin', 'superadmin']
    }
  ];

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-2xs">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block leading-tight">
              Portal Panitia
            </span>
            <span className="text-xs text-slate-500 font-medium">
              RAPIM TNI 2026
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Tutup menu sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Menu Admin" className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1.5 block">
          Menu Operasional
        </span>

        {menuItems.map(item => {
          const Icon = item.icon;
          const active =
            item.href === '/admin'
              ? pathname === '/admin' || pathname === '/admin/dashboard'
              : pathname === item.href ||
                (item.href === '/admin/guests' && pathname === '/admin/peserta') ||
                (item.href === '/admin/allocation' && (pathname === '/admin/allocation' || pathname === '/admin/placement' || pathname === '/admin/kursi')) ||
                (item.href === '/admin/monitoring' && pathname === '/admin/laporan');

          const isAllowed = !effectiveRole || item.allowedRoles.includes(effectiveRole);
          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) handleClose();
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold min-h-[44px] transition-colors ${
                active
                  ? 'bg-blue-50 text-primary border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 min-h-[44px] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Portal Publik</span>
          </span>
        </Link>

        {onLogout && (
          <button
            onClick={() => {
              if (isMobile) handleClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 min-h-[44px] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Fixed 280px */}
      <aside className="hidden lg:flex w-[280px] bg-white border-r border-slate-200 flex-col flex-shrink-0 fixed inset-y-0 left-0 h-screen z-40 overflow-y-auto">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
