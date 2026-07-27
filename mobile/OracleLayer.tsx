'use client';

import React from 'react';

/**
 * OracleLayer encapsulates mobile AI assistant bottom sheet overlays
 */
export function OracleLayer() {
  return (
    <div className="absolute inset-x-0 bottom-0 top-1/3 z-[500] pointer-events-auto bg-bg-panel border-t border-border-subtle rounded-t-2xl hidden" />
  );
}
export default OracleLayer;
