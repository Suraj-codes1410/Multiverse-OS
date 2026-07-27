'use client';

import React from 'react';
import { LayoutProvider, useLayout } from '@/providers/LayoutProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { DesktopShell } from '@/desktop';
import { MobileShell } from '@/mobile';

export interface SharedLayoutProps {
  children: React.ReactNode;
}

function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const { viewportType } = useLayout();

  if (viewportType === 'desktop') {
    return <DesktopShell>{children}</DesktopShell>;
  }

  return <MobileShell>{children}</MobileShell>;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <LayoutSwitcher>{children}</LayoutSwitcher>
      </LayoutProvider>
    </ThemeProvider>
  );
}
export default SharedLayout;
