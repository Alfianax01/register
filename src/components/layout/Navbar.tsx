'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, LogIn, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // STRICT PUBLIC LINKS ONLY
  const publicLinks = [
    { href: '/', label: 'Beranda & Informasi' },
    { href: '/register', label: 'Registrasi Peserta' },
    { href: '/ticket', label: 'Cari E-Ticket' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-sm bg-[#1E40AF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1d4ed8] transition-colors flex-shrink-0">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block leading-none truncate">
                Tentara Nasional Indonesia
              </span>
              <span className="text-[14px] sm:text-[16px] font-semibold text-[#0F172A] block leading-tight mt-0.5 truncate">
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
                  className={`text-[13px] lg:text-[14px] px-3 py-1.5 rounded-sm font-medium transition-all ${
                    active
                      ? 'text-[#1E40AF] bg-blue-50/80 font-semibold'
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
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] px-3 py-2 rounded-sm hover:bg-slate-50 transition-colors"
          >
            <Search className="w-4 h-4 text-[#64748B]" />
            <span>Cari E-Ticket</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-sm border border-slate-200/80 shadow-xs transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Portal Petugas</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button (Layar HP < 768px) */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/ticket"
            className="p-2 rounded-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title="Cari E-Ticket"
          >
            <Search className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-lg px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {[
              { href: '/register', label: 'Registrasi' },
              { href: '/ticket', label: 'Cari E-Ticket' },
            ].map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-[14px] px-3.5 py-2.5 rounded-sm font-medium transition-all ${
                    active
                      ? 'text-[#1E40AF] bg-blue-50 font-semibold'
                      : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-sm border border-slate-200"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Login Petugas / Panitia</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
