'use client';

import React from 'react';
import { NavigationProvider } from './NavigationProvider';
import { GestureProvider } from './GestureProvider';
import { StatusBar } from './StatusBar';
import { BottomNavigation } from './BottomNavigation';
import { HomeLayout } from './HomeLayout';
import { OracleLayer } from './OracleLayer';
import { Wallpaper } from '@/desktop/Wallpaper';

export interface MobileShellProps {
  children?: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <NavigationProvider>
      <GestureProvider>
        <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-bg-primary text-text-primary font-sans">
          
          {/* Layer 0: Animated Watercolor Gradient Wallpaper Backdrop */}
          <Wallpaper />

          {/* Layer 1: Phone Top Status Bar */}
          <StatusBar />

          {/* Layer 2: Main Application Screen Switcher Viewport */}
          <HomeLayout />

          {/* Layer 3: Assistant Bottom Sheet Chat Overlay */}
          <OracleLayer />

          {/* Layer 4: Phone Bottom Navigation Control Bar */}
          <BottomNavigation />
          
        </div>
      </GestureProvider>
    </NavigationProvider>
  );
}

export default MobileShell;
