// Centralized rounding corner border-radius design tokens
export const radius = {
  none: '0px',
  sm: '4px', // Small details rounding (checkboxes, tags)
  md: '8px', // Standard buttons & badge components rounding
  lg: '12px', // Standard card panels rounding (rounded-xl)
  xl: '16px', // Larger dashboard containers rounding (rounded-2xl)
  full: '9999px', // Circular buttons & round status indicators
} as const;

export type RadiusToken = typeof radius;
