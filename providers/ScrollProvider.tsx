'use client';

import React from 'react';

/**
 * ScrollProvider — Zero-overhead native scroll provider.
 * The Multiverse OS shell is a fixed-viewport 100vh workspace application.
 * Native hardware-accelerated scrolling inside subview containers provides
 * the lowest latency, zero main-thread RAF looping, and zero layout thrashing.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default ScrollProvider;
