'use client';

import React, { createContext, useContext, useState } from 'react';

interface AdminContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode; initialUser?: any }> = ({
  children,
  initialUser = null
}) => {
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer: () => setIsDrawerOpen(prev => !prev),
        closeDrawer: () => setIsDrawerOpen(false)
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

