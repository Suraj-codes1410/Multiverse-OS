'use client';

import React, { createContext, useContext, useState } from 'react';

export interface LayoutState {
  viewportType: 'desktop' | 'mobile';
  setViewportType: (type: 'desktop' | 'mobile') => void;
}

const LayoutContext = createContext<LayoutState | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [viewportType, setViewportType] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <LayoutContext.Provider value={{ viewportType, setViewportType }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};
