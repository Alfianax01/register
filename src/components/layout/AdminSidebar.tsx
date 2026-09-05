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
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/guests',
      label: 'Data Peserta',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN']
    },
    {
      href: '/admin/placement',
      label: 'Alokasi Kursi & Wisma',
      icon: Armchair,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_AKOMODASI']
    },
    {
      href: '/admin/scanner',
      label: 'Scan QR Gate',
      icon: QrCode,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE']
    },
    {
      href: '/admin/checkin',
      label: 'Log Presensi Check-In',
      icon: ClipboardCheck,
      allowedRoles: ['SUPER_ADMIN', 'PANITIA_GATE']
    },
    {
      href: '/admin/monitoring',
      label: 'Laporan & Statistik',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN']
    },
    {
      href: '/admin/settings',
      label: 'Pengaturan Sistem',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN']
    }
  ];

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block leading-tight">
              Portal Panitia
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              RAPIM TNI 2026
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup menu sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Menu Admin" className="p-3 space-y-1 flex-1 overflow-y-auto">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1 block">
          Menu Operasional
        </span>

        {menuItems.map(item => {
          const Icon = item.icon;
          const active =
            item.href === '/admin'
              ? pathname === '/admin' || pathname === '/admin/dashboard'
              : pathname === item.href ||
                (item.href === '/admin/guests' && pathname === '/admin/peserta') ||
                (item.href === '/admin/placement' && pathname === '/admin/kursi') ||
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
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100/80 shadow-xs'
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
            onClick={() => {
              if (isMobile) handleClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Permanent w-64 */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 min-h-screen sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Off-canvas panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
