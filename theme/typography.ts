// Centralized typographic system design tokens for standard styling and monospace components
export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif', // Inter for body layout text
    mono: 'var(--font-jetbrains-mono), monospace', // JetBrains Mono for terminals and code listings
  },
  fontSize: {
    xs: '13px', // Extra small - captions & metadata labels
    sm: '15px', // Small - dashboard panels & secondary text
    base: '17px', // Base - body copy reading text size
    lg: '19px', // Large - small card headers
    xl: '22px', // Extra large - section headers
    xxl: '26px', // XXL - card and widgets headlines
    xxxl: '34px', // XXXL - major module headers
    display: '50px', // Display - page banners headlines
    hero: '68px', // Hero - landing centerpiece title text
  },
  fontWeight: {
    light: '300', // Light font weight for body narrative
    normal: '400', // Normal text body copy
    medium: '500', // Medium weight for navigation tags and metadata
    bold: '700', // Bold weight for titles and action triggers
    black: '900', // Black weight for hero name titles
  },
  lineHeight: {
    none: '1', // No line height for buttons and tight overlays
    tight: '1.25', // Tight height for headings
    snug: '1.375', // Snug height for sub-headings
    normal: '1.5', // Standard paragraph height
    relaxed: '1.625', // Relaxed reading spacing height
  },
} as const;

export type TypographyToken = typeof typography;
