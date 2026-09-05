'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, Menu, X, Home, UserPlus, Ticket, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const publicLinks = [
    { href: '/', label: 'Beranda & Informasi', icon: Home },
    { href: '/register', label: 'Registrasi Peserta', icon: UserPlus },
    { href: '/ticket', label: 'Cari E-Ticket', icon: Ticket },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1d4ed8] transition-colors flex-shrink-0">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block leading-none truncate">
                  Tentara Nasional Indonesia
                </span>
                <span className="text-[14px] sm:text-[16px] font-semibold text-[#0F172A] block leading-tight mt-1 truncate">
                  Portal RAPIM 2026
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-4 h-8">
              {publicLinks.map(link => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] lg:text-[14px] px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                      active
                        ? 'text-[#1E40AF] bg-blue-50/90 font-semibold shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action on Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/ticket"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span>Cari E-Ticket</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#1E40AF] hover:bg-blue-700 px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </Link>
          </div>

          {/* Mobile Actions (< 768px) */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/ticket"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              title="Cari E-Ticket"
              aria-label="Cari E-Ticket"
            >
              <Search className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none"
              aria-label="Buka Menu Navigasi"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modern Off-Canvas Drawer for Mobile with Backdrop Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu Navigasi Mobile">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Sheet Panel */}
          <aside className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white shadow-xs">
                  <Shield className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block leading-none">
                    Mabes TNI
                  </span>
                  <span className="text-[13px] font-semibold text-[#0F172A] block leading-tight mt-0.5">
                    RAPIM 2026
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                aria-label="Tutup Menu Navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1 block">
                Menu Portal
              </span>

              {publicLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-[#1E40AF] font-semibold border border-blue-100'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center text-[11px] text-slate-400">
              Sekretariat Panitia RAPIM TNI 2026 &bull; Cilangkap
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
