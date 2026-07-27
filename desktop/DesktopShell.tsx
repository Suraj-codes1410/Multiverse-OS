'use client';

import React from 'react';
import { DesktopProvider } from './DesktopProvider';
import { WindowManager } from './WindowManager';
import { DockProvider } from './DockProvider';
import { Wallpaper } from './Wallpaper';
import { RobotLayer } from './RobotLayer';
import { OracleLayer } from './OracleLayer';
import { WidgetLayer } from './WidgetLayer';

export interface DesktopShellProps {
  children?: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  return (
    <DesktopProvider>
      <DockProvider>
        <div className="relative w-screen h-screen overflow-hidden select-none bg-bg-primary text-text-primary">
          <Wallpaper />
          <WidgetLayer />
          <WindowManager>{children}</WindowManager>
          <OracleLayer />
          <RobotLayer />
        </div>
      </DockProvider>
    </DesktopProvider>
  );
}
export default DesktopShell;
