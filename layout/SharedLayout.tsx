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

  return <MobileShell />;
}

import { SpotlightSearch } from '@/components/SpotlightSearch';
import { ContextMenu } from '@/components/ContextMenu';

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <LayoutSwitcher>{children}</LayoutSwitcher>
        <SpotlightSearch />
        <ContextMenu />
      </LayoutProvider>
    </ThemeProvider>
  );
}
export default SharedLayout;
