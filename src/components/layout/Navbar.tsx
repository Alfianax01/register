'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Ticket } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [navbarLogo, setNavbarLogo] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Load dynamic site settings if configured
    fetch('/api/settings/website')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.navbar_logo) {
          setNavbarLogo(data.settings.navbar_logo);
          setImgError(false);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand: [LOGO] TENTARA NASIONAL INDONESIA Portal RAPIM 2026 */}
        <Link
          href="/"
          className="flex items-center gap-[12px] group focus:outline-none"
        >
          {navbarLogo && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={navbarLogo}
              alt="Logo Tentara Nasional Indonesia"
              onError={() => setImgError(true)}
              className="w-[44px] h-[44px] object-contain flex-shrink-0 bg-transparent block select-none"
              style={{ width: '44px', height: '44px', objectFit: 'contain', backgroundColor: 'transparent' }}
            />
          ) : (
            <div className="w-[44px] h-[44px] rounded-xl bg-[#1E40AF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1d4ed8] transition-colors flex-shrink-0">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
          )}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block leading-tight truncate">
              TENTARA NASIONAL INDONESIA
            </span>
            <span className="text-[15px] sm:text-[16px] font-extrabold text-[#0F172A] block leading-tight mt-0.5 truncate">
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
