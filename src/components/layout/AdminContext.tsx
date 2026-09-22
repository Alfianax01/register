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

  useEffect(() => {
    if (siteSettings && typeof document !== 'undefined') {
      const root = document.documentElement;
      if (siteSettings.primary_color) root.style.setProperty('--primary', siteSettings.primary_color);
      if (siteSettings.secondary_color) root.style.setProperty('--primary-dark', siteSettings.secondary_color);
      if (siteSettings.gold_accent) root.style.setProperty('--gold-accent', siteSettings.gold_accent);
      if (siteSettings.gold_light) root.style.setProperty('--gold-light', siteSettings.gold_light);
      if (siteSettings.button_color) root.style.setProperty('--btn-action', siteSettings.button_color);
      if (siteSettings.sidebar_color) root.style.setProperty('--sidebar-bg', siteSettings.sidebar_color);
    }
  }, [siteSettings]);

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

