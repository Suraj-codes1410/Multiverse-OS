// Centralized responsive breakpoints mapping Tailwind's grid scale
export const breakpoints = {
  sm: '640px',     // Mobile devices landscape views
  md: '768px',     // Tablet screen viewports
  lg: '1024px',    // Standard laptop/desktop screens
  xl: '1280px',    // Larger desktop monitors
  xxl: '1536px',   // Wide display screens
  queries: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
  }
} as const;

export type BreakpointsToken = typeof breakpoints;
