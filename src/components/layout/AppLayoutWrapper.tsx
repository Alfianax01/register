'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-[#f8fafc]">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};
