'use client';

import React from 'react';
import { LayoutProvider } from '@/providers/LayoutProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <div className="min-h-screen bg-bg-primary text-text-primary antialiased">
          {children}
        </div>
      </LayoutProvider>
    </ThemeProvider>
  );
}
export default SharedLayout;
