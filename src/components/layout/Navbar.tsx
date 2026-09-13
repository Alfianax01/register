'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

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
    <header role="banner" className="sticky top-0 z-40 w-full h-[64px] sm:h-[76px] bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group rounded-xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all min-w-0"
          aria-label="Kembali ke Beranda Portal RAPIM TNI 2026"
        >
          {navbarLogo && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={navbarLogo}
              alt="Logo Tentara Nasional Indonesia"
              onError={() => setImgError(true)}
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain flex-shrink-0 bg-transparent block select-none"
            />
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white shadow-2xs group-hover:bg-primary-hover transition-colors flex-shrink-0">
              <Shield className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block leading-tight whitespace-nowrap">
              TENTARA NASIONAL INDONESIA
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight mt-0.5 whitespace-nowrap">
              Portal RAPIM 2026
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
