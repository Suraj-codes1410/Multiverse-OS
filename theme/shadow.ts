// Centralized visual elevation shadows and high-tech glow systems
export const shadow = {
  elevation: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  glow: {
    cyan: '0 0 10px rgba(0, 242, 254, 0.15)',      // Cyan interactive overlay glow
    purple: '0 0 12px rgba(168, 85, 247, 0.35)',    // Purple focus highlight glow
    success: '0 0 10px rgba(16, 185, 129, 0.2)',    // Emerald green nominal status glow
    warning: '0 0 10px rgba(245, 158, 11, 0.2)',    // Amber yellow alerts status glow
  }
} as const;

export type ShadowToken = typeof shadow;
