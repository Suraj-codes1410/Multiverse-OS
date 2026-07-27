'use client';

import React from 'react';

/**
 * RobotLayer oversees active web-agent interactions overlay blocks
 */
export function RobotLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[100] border border-transparent" />
  );
}
export default RobotLayer;
