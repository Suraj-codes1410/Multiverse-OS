'use client';

import React from 'react';
import { NavigationProvider } from './NavigationProvider';
import { GestureProvider } from './GestureProvider';
import { StatusBar } from './StatusBar';
import { BottomNavigation } from './BottomNavigation';
import { HomeLayout } from './HomeLayout';
import { OracleLayer } from './OracleLayer';

export interface MobileShellProps {
  children?: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <NavigationProvider>
      <GestureProvider>
        <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-bg-primary text-text-primary">
          <StatusBar />
          <HomeLayout>{children}</HomeLayout>
          <OracleLayer />
          <BottomNavigation />
        </div>
      </GestureProvider>
    </NavigationProvider>
  );
}
export default MobileShell;
