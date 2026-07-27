'use client';

import React, { createContext, useContext, useState } from 'react';

export interface ThemeState {
  themeName: 'default' | 'cyberpunk' | 'matrix' | 'high-contrast';
  setThemeName: (theme: 'default' | 'cyberpunk' | 'matrix' | 'high-contrast') => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<'default' | 'cyberpunk' | 'matrix' | 'high-contrast'>('default');

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
