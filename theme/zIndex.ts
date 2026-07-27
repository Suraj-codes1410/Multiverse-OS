// Centralized z-index layers system mapping application layout overlaps
export const zIndex = {
  base: 0,
  sticky: 50,                // Headers or stick-to-side components
  footer: 100,               // Page layout footers
  navbar: 200,               // Standard header navigation menus
  overlayBackground: 1000,   // Backdrop modals overlay layers
  floatControls: 9980,       // Floating action buttons (CLI terminal button / Oracle toggle button)
  fullscreenOverlay: 9990,   // Overlay terminal window and Oracle sidebar drawer
  bootSequenceBlocker: 9999, // Bios screen boot animation blocker
} as const;

export type ZIndexToken = typeof zIndex;
