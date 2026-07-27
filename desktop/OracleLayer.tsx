'use client';

import React from 'react';

/**
 * OracleLayer encapsulates desktop AI sidebars drawer system layouts
 */
export function OracleLayer() {
  return (
    <div className="absolute inset-y-0 right-0 z-[500] pointer-events-auto border-l border-border-subtle bg-bg-panel w-96 max-w-full hidden" />
  );
}
export default OracleLayer;
