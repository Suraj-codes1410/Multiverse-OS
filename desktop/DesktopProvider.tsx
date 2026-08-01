'use client';

import React, { useState, useCallback, useRef } from 'react';
import { DesktopContext, WindowInstance } from './DesktopContext';
import { windowRegistry } from './WindowRegistry';

export interface DesktopProviderProps {
  children: React.ReactNode;
}

/**
 * DesktopProvider holds stateful logic for the OS workstation:
 * tracks open, active, minimized, maximized, repositioned, and resized windows.
 */
export function DesktopProvider({ children }: DesktopProviderProps) {
  const [windows, setWindows] = useState<Record<string, WindowInstance>>({});
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const maxZIndexRef = useRef<number>(10);

  const getNextZIndex = useCallback(() => {
    maxZIndexRef.current += 1;
    return maxZIndexRef.current;
  }, []);

  const openWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const existing = prev[id];
        const registryMeta = windowRegistry[id] || {
          id,
          title: `App: ${id}`,
          defaultWidth: 600,
          defaultHeight: 400,
        };

        const defaultW = registryMeta.defaultWidth || 600;
        const defaultH = registryMeta.defaultHeight || 400;

        // Position offset cascades to prevent total overlay overlaps
        const staggerCount = Object.keys(prev).filter(
          (k) => prev[k].isOpen
        ).length;
        const defaultX = id === 'home' ? 80 : 100 + (staggerCount % 6) * 35;
        const defaultY = id === 'home' ? 40 : 80 + (staggerCount % 6) * 35;

        const nextZ = getNextZIndex();
        setActiveWindowId(id);

        return {
          ...prev,
          [id]: {
            id,
            title: registryMeta.title,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            x: existing?.x ?? defaultX,
            y: existing?.y ?? defaultY,
            width: existing?.width ?? defaultW,
            height: existing?.height ?? defaultH,
            zIndex: nextZ,
          },
        };
      });
    },
    [getNextZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isOpen: false,
        },
      };
    });
    setActiveWindowId((prevActive) => (prevActive === id ? null : prevActive));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setActiveWindowId((currentActive) => {
        if (currentActive === id) return currentActive;

        const nextZ = getNextZIndex();
        setWindows((prev) => {
          if (!prev[id]) return prev;
          return {
            ...prev,
            [id]: {
              ...prev[id],
              zIndex: nextZ,
              isMinimized: false,
            },
          };
        });
        return id;
      });
    },
    [getNextZIndex]
  );

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isMinimized: true,
        },
      };
    });

    // De-focus on minimize
    setActiveWindowId((prevActive) => {
      if (prevActive !== id) return prevActive;
      return null;
    });
  }, []);

  const restoreWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isMinimized: false,
          },
        };
      });
      focusWindow(id);
    },
    [focusWindow]
  );

  const maximizeWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isMaximized: !prev[id].isMaximized,
          },
        };
      });
      focusWindow(id);
    },
    [focusWindow]
  );

  const updateWindowPosition = useCallback(
    (id: string, x: number, y: number) => {
      setWindows((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            x,
            y,
          },
        };
      });
    },
    []
  );

  const updateWindowSize = useCallback(
    (id: string, width: number, height: number) => {
      setWindows((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            width,
            height,
          },
        };
      });
    },
    []
  );

  // Global listener for decoupled Spotlight search launches
  React.useEffect(() => {
    const handleLaunch = (e: Event) => {
      const appId = (e as CustomEvent).detail;
      if (appId) {
        openWindow(appId);
      }
    };
    window.addEventListener('launchApp', handleLaunch);
    return () => window.removeEventListener('launchApp', handleLaunch);
  }, [openWindow]);

  return (
    <DesktopContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        maximizeWindow,
        updateWindowPosition,
        updateWindowSize,
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
}
export default DesktopProvider;
