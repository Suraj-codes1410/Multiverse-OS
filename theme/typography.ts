// Centralized typographic system design tokens for standard styling and monospace components
export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif',        // Inter for body layout text
    mono: 'var(--font-jetbrains-mono), monospace',           // JetBrains Mono for terminals and code listings
  },
  fontSize: {
    xs: '12px',      // Extra small (0.75rem) - captions & metadata labels
    sm: '14px',      // Small (0.875rem) - dashboard panels & small copy text
    base: '16px',    // Base (1rem) - body copy reading text size
    lg: '18px',      // Large (1.125rem) - small card headers
    xl: '20px',      // Extra large (1.25rem) - section headers
    xxl: '24px',     // XXL (1.5rem) - card and widgets headlines
    xxxl: '32px',    // XXXL (2rem) - major module headers
    display: '48px', // Display (3rem) - page banners headlines
    hero: '64px',    // Hero (4rem) - landing centerpiece title text
  },
  fontWeight: {
    light: '300',    // Light font weight for body narrative
    normal: '400',   // Normal text body copy
    medium: '500',   // Medium weight for navigation tags and metadata
    bold: '700',     // Bold weight for titles and action triggers
    black: '900',    // Black weight for hero name titles
  },
  lineHeight: {
    none: '1',       // No line height for buttons and tight overlays
    tight: '1.25',   // Tight height for headings
    snug: '1.375',   // Snug height for sub-headings
    normal: '1.5',   // Standard paragraph height
    relaxed: '1.625',// Relaxed reading spacing height
  }
} as const;

export type TypographyToken = typeof typography;
