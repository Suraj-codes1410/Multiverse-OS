'use client';

import React from 'react';
import { useDesktop } from './DesktopContext';
import { DesktopWindow } from './DesktopWindow';

export interface WindowManagerProps {
  children?: React.ReactNode;
}

/**
 * WindowManager serves as the desktop coordinator layer.
 * Maps open windows from DesktopContext and overlays dragging window frames.
 */
export function WindowManager({ children }: WindowManagerProps) {
  const { windows } = useDesktop();

  const openWindows = Object.values(windows).filter((win) => win.isOpen);

  // Helper to render mock content for testing layout mechanics
  const renderWindowContent = (id: string) => {
    switch (id) {
      case 'sample-1':
        return (
          <div className="flex flex-col gap-3 font-mono text-xs h-full overflow-y-auto select-none">
            <div className="p-2 rounded bg-bg-panel/40 border border-border-subtle/50 text-success-green flex justify-between">
              <span>NODE_ID:</span>
              <span>US-EAST-01</span>
            </div>
            <div className="p-2 rounded bg-bg-panel/40 border border-border-subtle/50 text-accent-cyan flex justify-between">
              <span>CPU_LOAD:</span>
              <span>12.4% (Nominal)</span>
            </div>
            <div className="p-2 rounded bg-bg-panel/40 border border-border-subtle/50 text-accent-purple flex justify-between">
              <span>RAM_USED:</span>
              <span>4.18 GB / 16.0 GB</span>
            </div>
            <div className="text-[10px] text-text-secondary mt-2">
              Streaming active node metrics (Auto-sync active)...
            </div>
          </div>
        );
      case 'sample-2':
        return (
          <div className="flex flex-col gap-2 text-xs h-full overflow-y-auto font-sans leading-relaxed select-none">
            <h3 className="font-semibold text-text-primary text-sm font-mono text-accent-cyan">
              {'// System Telemetry Explorer'}
            </h3>
            <p className="text-text-secondary">
              This workspace window demonstrates absolute coordinate positioning, resizing boundaries, and mouse dragging handlers of the Multiverse-OS desktop shell.
            </p>
            <div className="mt-2 p-2.5 rounded bg-bg-panel/65 border border-border-subtle/50 font-mono text-[10px] text-text-secondary">
              <span className="text-accent-purple">import</span> {'{ WindowManager }'} <span className="text-accent-purple">from</span> <span className="text-success-green">"@/desktop"</span>;
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-secondary select-none">
            <span className="font-mono text-xs text-accent-cyan mb-2">{`[APP: ${id.toUpperCase()}]`}</span>
            <p className="text-xs">No active content linked. Application content placeholders ready for implementation.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {/* Dynamic Windows Layer */}
      {openWindows.map((win) => (
        <DesktopWindow key={win.id} id={win.id}>
          {renderWindowContent(win.id)}
        </DesktopWindow>
      ))}

      {/* Render children/original layouts outside the dynamic windows layer */}
      {children}
    </div>
  );
}
export default WindowManager;
