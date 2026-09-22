'use client';

import React, { useState, useEffect } from 'react';
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
  Settings,
  ChevronDown,
  UserCheck,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { useAdmin } from './AdminContext';

interface AdminSidebarProps {
  userRole?: string;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface SubMenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isExternal?: boolean;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: SubMenuItem[];
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
  const [imgError, setImgError] = useState(false);

  // Logo & Titles from Site Settings
  const logoUrl =
    adminCtx?.siteSettings?.logo_sidebar ||
    adminCtx?.siteSettings?.navbar_logo ||
    adminCtx?.siteSettings?.hero_logo ||
    '/images/logo-tni-rapim.png';

  const namaSistem = adminCtx?.siteSettings?.nama_sistem || 'PORTAL RAPIM TNI 2026';
  const sidebarColor = adminCtx?.siteSettings?.sidebar_color || '#6B0000';

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  // Accordion open states
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    peserta: true,
    auth: pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles'),
    laporan: false
  });

  // Keep accordion group open when navigating to child pages
  useEffect(() => {
    if (
      pathname.startsWith('/admin/guests') ||
      pathname.startsWith('/admin/allocation') ||
      pathname.startsWith('/admin/scanner') ||
      pathname.startsWith('/admin/monitoring')
    ) {
      setOpenGroups(prev => ({ ...prev, peserta: true }));
    }
    if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles')) {
      setOpenGroups(prev => ({ ...prev, auth: true }));
    }
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'peserta',
      label: 'Manajemen Peserta',
      icon: Users,
      items: [
        { href: '/admin/guests', label: 'Data Peserta', icon: Users },
        { href: '/admin/allocation', label: 'Penempatan Kursi & Wisma', icon: Armchair },
        { href: '/admin/scanner', label: 'Scan QR Gate', icon: QrCode },
        { href: '/admin/monitoring', label: 'Monitoring Presensi', icon: BarChart3 }
      ]
    },
    {
      id: 'auth',
      label: 'User Authorization',
      icon: Shield,
      items: [
        { href: '/admin/roles', label: 'User Group / Peran', icon: Layers },
        { href: '/admin/users', label: 'Daftar Pengguna', icon: UserCheck }
      ]
    },
    {
      id: 'laporan',
      label: 'Laporan & Ekspor',
      icon: FileText,
      items: [
        { href: '/api/export/pdf', label: 'Export Rekap PDF', icon: FileText, isExternal: true },
        { href: '/api/export/excel', label: 'Export Rekap Excel', icon: FileSpreadsheet, isExternal: true }
      ]
    }
  ];

  const isLinkActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <div
      className="flex flex-col h-full text-white select-none"
      style={{ backgroundColor: sidebarColor }}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/15">
        <div className="flex items-center gap-3 min-w-0">
          {!imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt="Logo TNI"
              onError={() => setImgError(true)}
              className="w-10 h-10 rounded-full object-contain bg-white/10 border border-[#D4AF37]/50 p-1 flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#8B0000] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] flex-shrink-0 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-[#D4AF37] tracking-widest uppercase block leading-none truncate">
              PUSINFOLAHTA TNI
            </span>
            <span
              className="text-xs font-bold text-white block truncate mt-1"
              title={namaSistem}
            >
              {namaSistem}
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Tutup menu sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav aria-label="Menu Admin" className="p-3 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
        {/* 1. Dashboard Utama (Direct Link) */}
        <Link
          href="/admin/dashboard"
          onClick={() => {
            if (isMobile) handleClose();
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
            isLinkActive('/admin/dashboard')
              ? 'bg-[#B8860B] text-white shadow-md border-l-4 border-white'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
          <span>Dashboard Utama</span>
        </Link>

        {/* 2. Accordion Groups (Manajemen Peserta & User Authorization) */}
        {menuGroups.slice(0, 2).map((group) => {
          const GroupIcon = group.icon;
          const isOpenState = !!openGroups[group.id];
          const hasActiveChild = group.items.some(item => isLinkActive(item.href));

          return (
            <div key={group.id} className="pt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  hasActiveChild
                    ? 'text-[#D4AF37] bg-black/20'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${
                    isOpenState ? 'rotate-180 text-[#D4AF37]' : ''
                  }`}
                />
              </button>

              {isOpenState && (
                <div className="mt-1 pl-4 pr-1 space-y-1 border-l-2 border-[#B8860B]/30 ml-3">
                  {group.items.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const active = isLinkActive(subItem.href);

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => {
                          if (isMobile) handleClose();
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                          active
                            ? 'bg-[#B8860B] text-white font-bold shadow-sm'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-[#D4AF37]/80'}`} />
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 3. Pengaturan Website (Direct Link) */}
        <div className="pt-1">
          <Link
            href="/admin/website"
            onClick={() => {
              if (isMobile) handleClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              isLinkActive('/admin/website')
                ? 'bg-[#B8860B] text-white shadow-md border-l-4 border-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
            <span>Pengaturan Website</span>
          </Link>
        </div>

        {/* 4. Laporan (Accordion) */}
        {menuGroups.slice(2, 3).map((group) => {
          const GroupIcon = group.icon;
          const isOpenState = !!openGroups[group.id];

          return (
            <div key={group.id} className="pt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${
                    isOpenState ? 'rotate-180 text-[#D4AF37]' : ''
                  }`}
                />
              </button>

              {isOpenState && (
                <div className="mt-1 pl-4 pr-1 space-y-1 border-l-2 border-[#B8860B]/30 ml-3">
                  {group.items.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <SubIcon className="w-3.5 h-3.5 text-[#D4AF37]/80" />
                        <span className="truncate">{subItem.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info & Footer Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5 bg-black/20 text-xs">
        {effectiveRole && (
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-1">
            <span className="text-[10px] text-white/60 uppercase tracking-wider block">
              Peran Aktif
            </span>
            <span className="font-bold text-[#D4AF37] truncate block">
              {effectiveRole}
            </span>
          </div>
        )}

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Portal Publik</span>
          </span>
        </Link>

        {onLogout && (
          <button
            type="button"
            onClick={() => {
              if (isMobile) handleClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-white transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Keluar Sistem</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Fixed 260px */}
      <aside className="hidden lg:flex w-[260px] flex-col flex-shrink-0 fixed inset-y-0 left-0 h-screen z-40 shadow-xl overflow-hidden border-r border-[#B8860B]/30">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
