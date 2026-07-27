// Centralized margin, padding, and gap spacing tokens mapping Tailwind's grid scale
export const spacing = {
  xs: '4px',    // Extra small (1 unit / 0.25rem) - small margins/padding
  sm: '8px',    // Small (2 units / 0.5rem) - component element gap spacings
  md: '16px',   // Medium (4 units / 1rem) - standard card padding
  lg: '24px',   // Large (6 units / 1.5rem) - vertical component block spacing
  xl: '32px',   // Extra large (8 units / 2rem) - landing section margins
  xxl: '48px',  // XXL (12 units / 3rem) - major layout section gaps
  xxxl: '64px', // XXXL (16 units / 4rem) - outer page layout gaps
  layout: {
    containerGap: '24px',  // Standard gap separating page grid layouts
    paddingMobile: '16px', // Side margins padding for mobile screen viewports
    paddingDesktop: '32px',// Side margins padding for desktop screen viewports
  }
} as const;

export type SpacingToken = typeof spacing;
