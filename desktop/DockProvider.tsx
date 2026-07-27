'use client';

import React, { createContext, useContext, useState } from 'react';

export interface DockState {
  isCollapsed: boolean;
}

const DockContext = createContext<DockState | null>(null);

export function DockProvider({ children }: { children: React.ReactNode }) {
  const [state] = useState<DockState>({ isCollapsed: false });

  return (
    <DockContext.Provider value={state}>
      {children}
    </DockContext.Provider>
  );
}

export const useDock = () => {
  const context = useContext(DockContext);
  return context;
};
