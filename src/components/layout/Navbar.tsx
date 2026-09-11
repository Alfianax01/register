'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'next-view-transitions';
import { Shield, Ticket } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [navbarLogo, setNavbarLogo] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
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
    <header role="banner" className="sticky top-0 z-40 w-full h-[76px] bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3.5 group rounded-xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
          aria-label="Kembali ke Beranda Portal RAPIM TNI 2026"
        >
          {navbarLogo && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={navbarLogo}
              alt="Logo Tentara Nasional Indonesia"
              onError={() => setImgError(true)}
              className="w-12 h-12 object-contain flex-shrink-0 bg-transparent block select-none"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-2xs group-hover:bg-primary-hover transition-colors flex-shrink-0">
              <Shield className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block leading-tight truncate">
              TENTARA NASIONAL INDONESIA
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight mt-0.5 truncate">
              Portal RAPIM 2026
            </span>
          </div>
        </Link>

        <Link
          href="/cari-e-ticket"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-4 py-2.5 min-h-[44px] rounded-xl shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Ticket className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>Cari E-Ticket</span>
        </Link>
      </div>
    </header>
  );
};
