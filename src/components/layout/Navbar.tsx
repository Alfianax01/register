'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Shield, QrCode, ClipboardList, LayoutDashboard, Menu, X, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta'
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda Acara', icon: Shield },
    { href: '/register', label: 'Registrasi Undangan', icon: ClipboardList },
    { href: '/ticket/my-ticket', label: 'Cek E-Ticket', icon: QrCode },
    { href: '/admin/login', label: 'Portal Panitia', icon: LayoutDashboard },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#070E0B]/90 border-b border-[#1E3B2F]">
      {/* Indonesian Flag Ribbon Bar */}
      <div className="w-full h-1.5 flex">
        <div className="h-full w-1/2 bg-[#B91C1C]" />
        <div className="h-full w-1/2 bg-[#FFFFFF]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Institution Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <TniEmblem matra="MABES" size="md" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                TENTARA NASIONAL INDONESIA
              </span>
              <span className="text-sm sm:text-base font-serif font-bold text-slate-100 tracking-wide">
                RAPIM TNI TAHUN 2026
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:block">
                Sistem E-Registrasi & Presensi Resmi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#153828] text-[#F5E296] border border-[#D4AF37]/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Status (WIB Time & Portal Indicator) */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-[#1E3B2F]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0F241A] border border-[#1E3B2F] text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-mono text-[11px] font-semibold">{timeString || 'WIB'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E3B2F] bg-[#0A1610] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-[#153828] text-[#F5E296] border border-[#D4AF37]/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 text-[#D4AF37]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

