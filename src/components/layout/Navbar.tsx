'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, QrCode, LogIn, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {}
    };
    checkUserRole();
  }, [pathname]);

  const isAdmin = !!currentUser;

  // Base links visible to public
  const publicLinks = [
    { href: '/', label: 'Registrasi Acara' },
    { href: '/ticket/my-ticket', label: 'Cari E-Ticket' },
  ];

  // Admin-only links
  const adminLinks = [
    { href: '/admin/scanner', label: 'Scanner Gate' },
    { href: '/admin/placement', label: 'Penempatan Kursi' },
    { href: '/admin/monitoring', label: 'Monitoring' },
  ];

  const visibleLinks = isAdmin ? [...publicLinks, ...adminLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-[#1E40AF] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1e3a8a] transition-colors">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block leading-none">
                Tentara Nasional Indonesia
              </span>
              <span className="text-[16px] font-semibold text-[#0F172A] block leading-tight mt-0.5">
                Portal RAPIM 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-2 ml-4 border-l border-slate-200 pl-6 h-8">
            {visibleLinks.map(link => {
              const active = pathname === link.href || (link.href === '/' && pathname === '/register');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] px-3.5 py-2 rounded-sm font-medium transition-all ${
                    active
                      ? 'text-[#1E40AF] bg-blue-50/80 font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/ticket/my-ticket"
            className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] px-3 py-2 rounded-sm hover:bg-slate-50 transition-colors"
          >
            <Search className="w-4 h-4 text-[#64748B]" />
            <span>Cek Tiket</span>
          </Link>

          {isAdmin ? (
            <Link
              href="/admin/scanner"
              className="inline-flex items-center gap-2 text-[14px] font-medium bg-[#1E40AF] text-white hover:bg-[#1e3a8a] px-4 py-2.5 rounded-sm shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scanner Gate</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-sm border border-slate-200/80 transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#64748B]" />
              <span>Portal Petugas</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
