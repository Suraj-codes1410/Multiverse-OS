'use client';

import React from 'react';
import { DesktopProvider } from './DesktopProvider';
import { WindowManager } from './WindowManager';
import { DockProvider } from './DockProvider';
import { Wallpaper } from './Wallpaper';
import { RobotLayer } from './RobotLayer';
import { OracleLayer } from './OracleLayer';
import { WidgetLayer } from './WidgetLayer';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { useDesktop } from './DesktopContext';
import { usePathname } from 'next/navigation';
import { onBootPhase, isReturningVisitor } from '@/lib/bootPhase';

export interface DesktopShellProps {
  children?: React.ReactNode;
}

/**
 * DesktopShell forms the core workspace workstation shell grid layouts.
 * Mounts the stateful providers (DesktopProvider, DockProvider).
 */
export function DesktopShell({ children }: DesktopShellProps) {
  return (
    <DesktopProvider>
      <DockProvider>
        <DesktopShellInner>{children}</DesktopShellInner>
      </DockProvider>
    </DesktopProvider>
  );
}

/**
 * DesktopShellInner accesses the active OS context to bind window actions
 * directly to MenuBar triggers and Dock items selection actions.
 */
function DesktopShellInner({ children }: { children: React.ReactNode }) {
  const { openWindow, activeWindowId, windows } = useDesktop();
  const openAppIds = Object.keys(windows).filter((key) => windows[key].isOpen);
  const pathname = usePathname();

  // Synchronize route paths changes with window manager launch operations
  React.useEffect(() => {
    const mapPathToWindowId = (path: string): string | null => {
      if (path === '/') return 'home';
      if (path.startsWith('/projects')) return 'projects';
      if (path.startsWith('/about')) return 'about';
      if (path.startsWith('/timeline')) return 'timeline';
      if (path.startsWith('/skills')) return 'settings';
      if (path.startsWith('/contact')) return 'contact';
      if (path.startsWith('/recruiter')) return 'dashboard';
      if (path.startsWith('/github')) return 'explorer';
      return null;
    };

    const targetWinId = mapPathToWindowId(pathname);
    if (targetWinId) {
      openWindow(targetWinId);
    }
  }, [pathname, openWindow]);

  // Auto-open Home window as the final step of the boot sequence reveal
  React.useEffect(() => {
    return onBootPhase((phase) => {
      if (phase === 'done') {
        // Slight extra delay so the overlay fully dissolves first
        const delay = isReturningVisitor() ? 100 : 200;
        setTimeout(() => openWindow('home'), delay);
      }
    });
  }, [openWindow]);

  return (
    /* Fullscreen Desktop Main Grid Container */
    <div data-context-menu="desktop" className="relative w-screen h-screen overflow-hidden select-none bg-bg-primary text-text-primary flex flex-col font-sans">
      
      {/* Layer 5: System Menu Bar (Fixed top bar) */}
      <MenuBar />

      {/* Layer 0: Fullscreen Wallpaper (radial background meshes + animated canvas particles) */}
      <Wallpaper />
      
      {/* Layer 1: Ambient Widget System stats overlay */}
      <WidgetLayer />
      
      {/* Layer 2: Desktop active workspace grid utilizing safe margin paddings (top offset for MenuBar) */}
      <div className="relative flex-grow w-full h-full flex pt-16 px-6 pb-24 z-10 box-border gap-6 overflow-hidden">
        
        {/* Workspace center viewport for windows rendering */}
        <main className="flex-grow h-full relative flex flex-col pointer-events-auto">
          <WindowManager>
            {children}
          </WindowManager>
        </main>
        
      </div>

      {/* Layer 6: System Application Dock (Fixed bottom bar panel connected to context actions) */}
      <Dock activeAppId={activeWindowId} openAppIds={openAppIds} onAppClick={openWindow} />
      
      {/* Layer 3: Oracle Conversational Chat drawer layer */}
      <OracleLayer />
      
      {/* Layer 4: Background Web Agents highlight scanner layer */}
      <RobotLayer />
      
    </div>
  );
}

export default DesktopShell;
