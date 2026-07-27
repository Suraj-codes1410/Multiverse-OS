'use client';

import React, { useState } from 'react';
import { DesktopContext, DesktopState } from './DesktopContext';

export interface DesktopProviderProps {
  children: React.ReactNode;
}

export function DesktopProvider({ children }: DesktopProviderProps) {
  const [state] = useState<DesktopState>({
    activeWindowId: null,
    openedWindowIds: [],
  });

  return (
    <DesktopContext.Provider value={state}>
      {children}
    </DesktopContext.Provider>
  );
}
