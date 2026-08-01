'use client';

import React, { createContext, useContext, useState } from 'react';

export interface NavigationState {
  activeTab: 'home' | 'oracle' | 'terminal';
  setActiveTab: (tab: 'home' | 'oracle' | 'terminal') => void;
  activeAppId: string | null;
  setActiveAppId: (appId: string | null) => void;
  openApp: (appId: string) => void;
  closeApp: () => void;
}

const NavigationContext = createContext<NavigationState | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'home' | 'oracle' | 'terminal'>(
    'home'
  );
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const openApp = (appId: string) => {
    setActiveAppId(appId);
    setActiveTab('home'); // Ensure we are on home tab scope when app is running
  };

  const closeApp = () => {
    setActiveAppId(null);
  };

  React.useEffect(() => {
    const handleLaunch = (e: Event) => {
      const appId = (e as CustomEvent).detail;
      if (appId) {
        if (appId === 'oracle') {
          setActiveTab('oracle');
          setActiveAppId(null);
        } else if (appId === 'terminal') {
          setActiveTab('terminal');
          setActiveAppId(null);
        } else {
          openApp(appId);
        }
      }
    };
    window.addEventListener('launchApp', handleLaunch);
    return () => window.removeEventListener('launchApp', handleLaunch);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeAppId,
        setActiveAppId,
        openApp,
        closeApp,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
