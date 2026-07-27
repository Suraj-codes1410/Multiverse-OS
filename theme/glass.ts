// Centralized glassmorphic transparency tokens (backgrounds, blurs, and borders)
export const glass = {
  blur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
  },
  bg: {
    thin: 'rgba(10, 12, 22, 0.3)',      // 30% alpha for standard interactive cards
    medium: 'rgba(10, 12, 22, 0.5)',    // 50% alpha for page layout panels
    thick: 'rgba(10, 12, 22, 0.85)',    // 85% alpha for solid dashboard overlays
    primaryThin: 'rgba(3, 4, 7, 0.75)',  // 75% alpha for root backdrop overlays
  },
  border: {
    subtle: 'rgba(30, 41, 59, 0.4)',
    bright: 'rgba(51, 65, 85, 0.6)',
    accentCyan: 'rgba(0, 242, 254, 0.25)',
    accentPurple: 'rgba(168, 85, 247, 0.25)',
  },
  presets: {
    panel: {
      background: 'rgba(10, 12, 22, 0.5)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(30, 41, 59, 0.4)',
    },
    panelHover: {
      background: 'rgba(17, 20, 36, 0.6)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
    },
    overlay: {
      background: 'rgba(3, 4, 7, 0.75)',
      backdropFilter: 'blur(4px)',
    }
  }
} as const;

export type GlassToken = typeof glass;
