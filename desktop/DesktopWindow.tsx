'use client';

import React, { useState } from 'react';
import { useDesktop } from './DesktopContext';
import { motion } from 'framer-motion';

export interface DesktopWindowProps {
  id: string;
  children?: React.ReactNode;
  toolbar?: React.ReactNode;
}

/**
 * DesktopWindow forms the stateful floating window frame of the OS.
 * Features drag-handles, traffic light buttons, toolbars, and resize bounds.
 */
export function DesktopWindow({ id, children, toolbar }: DesktopWindowProps) {
  const [controlsHovered, setControlsHovered] = useState<boolean>(false);
  const {
    windows,
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useDesktop();

  const windowInst = windows[id];

  // Do not render if not open or minimized
  if (!windowInst || !windowInst.isOpen || windowInst.isMinimized) {
    return null;
  }

  const isActive = activeWindowId === id;

  // Header dragging mouse event handler
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (windowInst.isMaximized) return;
    
    // Only drag on left click and ignore click events on action buttons
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.window-action-btn')) return;

    e.preventDefault();
    focusWindow(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = windowInst.x;
    const initialY = windowInst.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Clamp coordinates to keep window header visible below top MenuBar
      const newX = Math.max(0, Math.min(window.innerWidth - 150, initialX + dx));
      const newY = Math.max(40, Math.min(window.innerHeight - 100, initialY + dy)); // 40px MenuBar offset
      
      updateWindowPosition(id, newX, newY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handler mouse event
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);

    const startW = windowInst.width;
    const startH = windowInst.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dw = moveEvent.clientX - startX;
      const dh = moveEvent.clientY - startY;
      
      // Minimum window sizes
      const newW = Math.max(320, startW + dw);
      const newH = Math.max(220, startH + dh);
      
      updateWindowSize(id, newW, newH);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Inline styling for precise absolute positioning
  const windowStyle: React.CSSProperties = windowInst.isMaximized
    ? {
        position: 'absolute',
        left: 0,
        top: 40, // Height of top MenuBar
        width: '100vw',
        height: 'calc(100vh - 40px)',
        zIndex: windowInst.zIndex,
      }
    : {
        position: 'absolute',
        left: windowInst.x,
        top: windowInst.y,
        width: windowInst.width,
        height: windowInst.height,
        zIndex: windowInst.zIndex,
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 15 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={windowStyle}
      onClick={() => focusWindow(id)}
      className={`flex flex-col rounded-xl overflow-hidden bg-bg-panel/75 border backdrop-blur-xl transition-shadow duration-200 pointer-events-auto select-text shadow-2xl ${
        isActive
          ? 'border-accent-cyan/35 shadow-[0_20px_50px_rgba(0,242,254,0.15)]'
          : 'border-border-subtle/50'
      }`}
      role="dialog"
      aria-label={windowInst.title}
    >
      {/* WINDOW HEADER */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`h-9 px-3 flex items-center justify-between cursor-move select-none border-b font-mono text-xs ${
          isActive
            ? 'bg-bg-panel-hover/80 text-text-primary border-accent-cyan/20'
            : 'bg-bg-panel/50 text-text-secondary border-border-subtle/50'
        }`}
      >
        {/* Traffic Lights Controls (macOS style red/yellow/green) */}
        <div
          className="flex items-center gap-1.5 w-16"
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
        >
          {/* Close */}
          <button
            onClick={() => closeWindow(id)}
            className="window-action-btn w-3 h-3 rounded-full bg-[#ff5f56] active:bg-[#bf4941] flex items-center justify-center text-[7px] font-bold text-[#4c0002] transition-colors focus:outline-none cursor-pointer"
            aria-label="Close Window"
          >
            {controlsHovered && '×'}
          </button>

          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(id)}
            className="window-action-btn w-3 h-3 rounded-full bg-[#ffbd2e] active:bg-[#beb222] flex items-center justify-center text-[7px] font-bold text-[#5c3e00] transition-colors focus:outline-none cursor-pointer"
            aria-label="Minimize Window"
          >
            {controlsHovered && '–'}
          </button>

          {/* Maximize */}
          <button
            onClick={() => maximizeWindow(id)}
            className="window-action-btn w-3 h-3 rounded-full bg-[#27c93f] active:bg-[#1a9c2b] flex items-center justify-center text-[6px] font-bold text-[#006504] transition-colors focus:outline-none cursor-pointer"
            aria-label="Maximize Window"
          >
            {controlsHovered && '+'}
          </button>
        </div>

        {/* Window Title */}
        <span className="font-semibold tracking-wide truncate max-w-[50%] select-none">
          {windowInst.title}
        </span>

        {/* Dynamic Telemetry Info Node Placeholder */}
        <div className="w-16 text-right text-[9px] text-text-secondary/70 uppercase tracking-widest hidden md:block">
          {isActive ? 'Active' : 'Muted'}
        </div>
      </div>

      {/* WINDOW TOOLBAR PLACEHOLDER */}
      {toolbar ? (
        <div className="h-8 border-b border-border-subtle/50 bg-bg-panel/30 flex items-center px-3 gap-2">
          {toolbar}
        </div>
      ) : (
        <div className="h-8 border-b border-border-subtle/30 bg-bg-panel/15 flex items-center justify-between px-3 text-[10px] text-text-secondary font-mono select-none">
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-text-primary transition-colors">File</span>
            <span className="cursor-pointer hover:text-text-primary transition-colors">Edit</span>
            <span className="cursor-pointer hover:text-text-primary transition-colors">Telemetry</span>
          </div>
          <div className="text-[9px] text-accent-cyan/80">
            WS_READY //
          </div>
        </div>
      )}

      {/* WINDOW BODY */}
      <div className="flex-grow w-full overflow-hidden relative bg-bg-primary/20 flex flex-col p-4">
        {children}
      </div>

      {/* WINDOW RESIZE HANDLES (Clamps sizes on drag movements) */}
      {!windowInst.isMaximized && (
        <>
          {/* Diagonal Bottom-Right Resize Handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5"
            style={{ zIndex: 100 }}
            aria-hidden="true"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-text-secondary opacity-50">
              <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="6" y1="3" x2="3" y2="6" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
}
export default DesktopWindow;
