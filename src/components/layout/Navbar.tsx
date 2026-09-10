'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Ticket } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [navbarLogo, setNavbarLogo] = useState<string | null>(null);

  useEffect(() => {
    // Load dynamic site settings if configured
    fetch('/api/settings/website')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.navbar_logo) {
          setNavbarLogo(data.settings.navbar_logo);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand: [Logo] Portal RAPIM 2026 */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
        >
          {navbarLogo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={navbarLogo}
              alt="Logo RAPIM TNI 2026"
              className="w-10 h-10 object-contain rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#1E40AF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1d4ed8] transition-colors flex-shrink-0">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block leading-none truncate">
              Tentara Nasional Indonesia
            </span>
            <span className="text-[14px] sm:text-[16px] font-bold text-[#0F172A] block leading-tight mt-1 truncate">
              Portal RAPIM 2026
            </span>
          </div>
        </Link>

        {/* Right Action: Single "Cari E-Ticket" Button */}
        <Link
          href="/cari-e-ticket"
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#1E40AF] bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/80 px-3.5 py-2 rounded-lg shadow-2xs transition-colors"
        >
          <Ticket className="w-4 h-4 text-[#1E40AF]" />
          <span>Cari E-Ticket</span>
        </Link>
      </div>
    </header>
  );
};
