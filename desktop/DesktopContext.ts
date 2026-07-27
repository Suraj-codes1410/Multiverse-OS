'use client';

import { createContext, useContext } from 'react';

export interface DesktopState {
  activeWindowId: string | null;
  openedWindowIds: string[];
}

export const DesktopContext = createContext<DesktopState | null>(null);

export const useDesktop = () => {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within DesktopProvider');
  }
  return context;
};
