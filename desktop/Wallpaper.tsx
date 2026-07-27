'use client';

import React from 'react';

export function Wallpaper() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-bg-primary">
      {/* Background glow meshes using central CSS properties */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--wallpaper-glow-primary),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--wallpaper-grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--wallpaper-grid-color)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-20" />
    </div>
  );
}
export default Wallpaper;
