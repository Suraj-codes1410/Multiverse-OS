// Centralized design color tokens mapping globals.css theme variables
export const colors = {
  bg: {
    primary: '#030407',      // Deep midnight base background color
    panel: '#0a0c16',        // Transparent slate navy panel/card background
    panelHover: '#111424',   // Lighter navy hover state background
  },
  accent: {
    cyan: '#00f2fe',         // Primary action accent color (cyan)
    purple: '#a855f7',       // Secondary visual focus accent color (purple)
  },
  feedback: {
    success: '#10b981',      // System nominal operational state (emerald green)
    warning: '#f59e0b',      // Failover or system warning states (amber yellow)
  },
  text: {
    primary: '#ffffff',      // Standard high-contrast copy text color
    secondary: '#94a3b8',    // Muted descriptions slate copy color
  },
  border: {
    subtle: '#1e293b',       // Inactive divider borders color
    bright: '#334155',       // Active/focus state borders color
  }
} as const;

export type ColorsToken = typeof colors;
