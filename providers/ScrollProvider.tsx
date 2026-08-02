'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only initialize Lenis on devices where page scrolling is applicable (e.g. mobile or standard viewport scrolling)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      prevent: (node) => {
        // If the element or its parent has overflow-y: auto/scroll, let it scroll natively
        let current: HTMLElement | null = node as HTMLElement;
        while (current && current !== document.body) {
          if (current.scrollHeight > current.clientHeight) {
            const style = window.getComputedStyle(current);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
              return true;
            }
          }
          current = current.parentElement;
        }
        return false;
      },
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export default ScrollProvider;
