'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDesktop } from './DesktopContext';
import { motion } from 'framer-motion';
import {
  playOpenSound,
  playCloseSound,
  playMinimizeSound,
  playMaximizeSound,
} from '@/lib/useOsAudio';

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

  // Do not render if window registry entry is missing
  if (!windowInst) {
    return null;
  }

  const isActive = activeWindowId === id;

  // Play open chime once on first render (window opened)
  const didPlayRef = useRef(false);
  useEffect(() => {
    if (!didPlayRef.current && windowInst?.isOpen) {
      didPlayRef.current = true;
      // Small delay so the animation starts first
      const t = setTimeout(() => playOpenSound(), 60);
      return () => clearTimeout(t);
    }
  }, [windowInst?.isOpen]);

  // Header dragging mouse event handler
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (windowInst.isMaximized) return;
    
    // Only drag on left click and ignore click events on action buttons
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('.window-action-btn') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea')
    ) {
      return;
    }

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

  // ── 8-direction resize system ──────────────────────────────────────
  type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

  const handleResizeMouseDown = (e: React.MouseEvent, edge: ResizeEdge) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);

    const startW   = windowInst.width;
    const startH   = windowInst.height;
    const startX   = windowInst.x;
    const startY   = windowInst.y;
    const mouseX   = e.clientX;
    const mouseY   = e.clientY;

    const onMove = (mv: MouseEvent) => {
      const dx = mv.clientX - mouseX;
      const dy = mv.clientY - mouseY;

      let newW = startW, newH = startH, newX = startX, newY = startY;

      // Horizontal
      if (edge.includes('e')) newW = Math.max(320, startW + dx);
      if (edge.includes('w')) { newW = Math.max(320, startW - dx); newX = startX + (startW - newW); }
      // Vertical
      if (edge.includes('s')) newH = Math.max(220, startH + dy);
      if (edge.includes('n')) { newH = Math.max(220, startH - dy); newY = startY + (startH - newH); }

      updateWindowSize(id, newW, newH);
      if (edge.includes('w') || edge.includes('n')) {
        updateWindowPosition(id, newX, newY);
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
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

  // Genie minimize slide down animation arpeggio variants
  const windowVariants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    },
    minimized: {
      opacity: 0,
      scale: 0.12,
      y: typeof window !== 'undefined' ? window.innerHeight - windowInst.y - 45 : 300,
      x: typeof window !== 'undefined' ? (window.innerWidth / 2) - windowInst.x - (windowInst.width / 2) : 0,
    }
  };

  return (
    <motion.div
      variants={windowVariants}
      animate={windowInst.isMinimized ? 'minimized' : 'open'}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        ...windowStyle,
        // Reliably block pointer events on minimized windows via inline style
        pointerEvents: windowInst.isMinimized ? 'none' : 'auto',
      }}
      onMouseDownCapture={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.window-action-btn')) return;
        if (!isActive) {
          focusWindow(id);
        }
      }}
      onFocus={() => focusWindow(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          focusWindow(id);
        }
      }}
      tabIndex={0}
      className={`flex flex-col rounded-2xl overflow-hidden bg-window-bg border border-window-border backdrop-blur-md transition-shadow duration-300 select-text shadow-lg focus:outline-none ${
        isActive
          ? 'shadow-xl ring-1 ring-accent-cyan/15'
          : 'opacity-[0.99]'
      }`}
      role="dialog"
      aria-label={windowInst.title}
    >
      {/* WINDOW HEADER */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`h-11 px-4 flex items-center justify-between cursor-move select-none border-b transition-colors duration-200 ${
          isActive
            ? 'bg-bg-panel-hover/50 text-window-title border-window-border/50 font-medium'
            : 'bg-bg-panel/30 text-text-secondary/70 border-window-border/30'
        }`}
      >
        {/* Traffic Lights Controls (macOS style red/yellow/green) */}
        <div
          className="flex items-center gap-1.5 w-16"
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
        >
          {/* Close */}
          {id !== 'home' ? (
            <button
              onClick={() => { playCloseSound(); closeWindow(id); }}
              className="window-action-btn w-3 h-3 rounded-full bg-[#ff5f56] active:bg-[#bf4941] flex items-center justify-center text-[7px] font-bold text-[#4c0002] transition-colors focus:outline-none cursor-pointer"
              aria-label="Close Window"
            >
              {controlsHovered && '×'}
            </button>
          ) : (
            <div 
              className="w-3 h-3 rounded-full bg-border-subtle/40 cursor-not-allowed" 
              title="Home workspace cannot be closed"
            />
          )}

          {/* Minimize */}
          <button
            onClick={() => { playMinimizeSound(); minimizeWindow(id); }}
            className="window-action-btn w-3 h-3 rounded-full bg-[#ffbd2e] active:bg-[#beb222] flex items-center justify-center text-[7px] font-bold text-[#5c3e00] transition-colors focus:outline-none cursor-pointer"
            aria-label="Minimize Window"
          >
            {controlsHovered && '–'}
          </button>

          {/* Maximize */}
          <button
            onClick={() => { playMaximizeSound(); maximizeWindow(id); }}
            className="window-action-btn w-3 h-3 rounded-full bg-[#27c93f] active:bg-[#1a9c2b] flex items-center justify-center text-[6px] font-bold text-[#006504] transition-colors focus:outline-none cursor-pointer"
            aria-label="Maximize Window"
          >
            {controlsHovered && '+'}
          </button>
        </div>

        {/* Window Title */}
        <span className="font-sans font-medium text-text-primary tracking-tight truncate max-w-[50%] select-none text-xs">
          {windowInst.title}
        </span>

        {/* Dynamic Telemetry Info Node Placeholder */}
        <div className="w-16 text-right text-[9px] text-text-secondary/70 uppercase tracking-widest hidden md:block font-mono">
          {isActive ? 'Active' : 'Muted'}
        </div>
      </div>

      {/* WINDOW TOOLBAR PLACEHOLDER */}
      {toolbar ? (
        <div className="h-8 border-b border-window-border/40 bg-bg-panel/30 flex items-center px-3 gap-2">
          {toolbar}
        </div>
      ) : (
        <div className="h-9 border-b border-window-border/30 bg-bg-panel/15 flex items-center justify-between px-4 text-[10px] text-text-secondary/80 font-mono select-none">
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
      <div className="flex-grow w-full overflow-hidden relative bg-window-bg flex flex-col p-5">
        {children}
      </div>

      {/* WINDOW RESIZE HANDLES — 8 directions */}
      {!windowInst.isMaximized && (
        <>
          {/* Edges */}
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'n')}  className="absolute top-0    left-2   right-2  h-1   cursor-n-resize  z-[90]" aria-hidden />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 's')}  className="absolute bottom-0 left-2   right-2  h-1   cursor-s-resize  z-[90]" aria-hidden />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'e')}  className="absolute top-2  right-0  bottom-2 w-1   cursor-e-resize  z-[90]" aria-hidden />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'w')}  className="absolute top-2  left-0   bottom-2 w-1   cursor-w-resize  z-[90]" aria-hidden />
          {/* Corners */}
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} className="absolute top-0    left-0   w-3 h-3  cursor-nw-resize z-[91]" aria-hidden />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} className="absolute top-0    right-0  w-3 h-3  cursor-ne-resize z-[91]" aria-hidden />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} className="absolute bottom-0 left-0   w-3 h-3  cursor-sw-resize z-[91]" aria-hidden />
          {/* SE corner with visual grip dots */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-[91]"
            aria-hidden
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-text-secondary opacity-40">
              <circle cx="6" cy="6" r="1" fill="currentColor" />
              <circle cx="3" cy="6" r="1" fill="currentColor" />
              <circle cx="6" cy="3" r="1" fill="currentColor" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
}
export default DesktopWindow;
