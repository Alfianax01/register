'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '@/types/settings';

interface AdminContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  siteSettings: SiteSettings | null;
  refreshSiteSettings: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode; initialUser?: any }> = ({
  children,
  initialUser = null
}) => {
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const refreshSiteSettings = async () => {
    try {
      const res = await fetch('/api/settings/website');
      if (res.ok) {
        const data = await res.json();
        if (data?.settings) {
          setSiteSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('[AdminContext] Failed to fetch site settings:', err);
    }
  };

  useEffect(() => {
    refreshSiteSettings();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer: () => setIsDrawerOpen(prev => !prev),
        closeDrawer: () => setIsDrawerOpen(false),
        siteSettings,
        refreshSiteSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  return ctx;
};

