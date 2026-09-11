'use client';

import { FC, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

interface AppLayoutWrapperProps {
  children: ReactNode;
}

/** Fungsi helper untuk set favicon dinamis dari base64 data URI atau URL */
function setDynamicFavicon(faviconValue: string) {
  if (!faviconValue || typeof document === 'undefined') return;
  try {
    const existing = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (existing) {
      existing.href = faviconValue;
      if (faviconValue.startsWith('data:image/svg')) {
        existing.type = 'image/svg+xml';
      }
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = faviconValue.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
      link.href = faviconValue;
      document.head.appendChild(link);
    }
  } catch {
    // Abaikan error jika DOM belum siap
  }
}

export const AppLayoutWrapper: FC<AppLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    // Fetch favicon dari settings website secara asynchronous
    fetch('/api/settings/website')
      .then(res => res.json())
      .then(data => {
        const favicon = data?.settings?.favicon;
        if (favicon) setDynamicFavicon(favicon);
      })
      .catch(() => {}); // Gagal fetch: biarkan favicon default dari /favicon.ico
  }, []);

  if (isAdminRoute) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-[#f8fafc]">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f8fafc]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-semibold text-xs sm:text-sm transition-all"
      >
        Lewati ke konten utama
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col w-full outline-none">
        {children}
      </main>
    </div>
  );
};
