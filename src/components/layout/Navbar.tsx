'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, LayoutDashboard, Shield, Search, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Registrasi & Scanner' },
    { href: '/ticket/my-ticket', label: 'Cari E-Ticket' },
    { href: '/admin/checkin', label: 'Scanner Gate' },
    { href: '/admin/placement', label: 'Penempatan' },
    { href: '/admin/monitoring', label: 'Monitoring' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 tracking-tight">
                TNI Event Pass
              </span>
              <Badge variant="neutral" size="sm" className="hidden sm:inline-flex text-[10px]">
                RAPIM 2026
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
            {links.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    active
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/ticket/my-ticket"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cek NRP</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Portal Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
