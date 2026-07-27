'use client';

import React, { createContext, useContext } from 'react';

export interface GestureState {
  swipeDirection: 'left' | 'right' | 'none';
}

const GestureContext = createContext<GestureState>({ swipeDirection: 'none' });

export function GestureProvider({ children }: { children: React.ReactNode }) {
  return (
    <GestureContext.Provider value={{ swipeDirection: 'none' }}>
      {children}
    </GestureContext.Provider>
  );
}

export const useGesture = () => {
  const context = useContext(GestureContext);
  return context;
};
