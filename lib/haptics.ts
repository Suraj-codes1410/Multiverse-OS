'use client';

/**
 * haptics — Hardware tactile vibration engine for Multiverse-OS.
 * Provides micro-tuned vibration profiles that mimic physical mechanical relays,
 * tactile switches, and spring snaps. Falls back gracefully when unsupported.
 */

let hapticsEnabled = true;

export const haptic = {
  /** Check if vibration API is supported on current client */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  },

  /** Check if haptics are currently toggled ON */
  isEnabled(): boolean {
    return hapticsEnabled;
  },

  /** Toggle global haptic vibration feedback */
  setEnabled(enabled: boolean): void {
    hapticsEnabled = enabled;
  },

  /** Soft micro-tick for standard buttons, chips, and links (8ms) */
  tap(): void {
    if (!hapticsEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(8);
    } catch {
      // Ignore vibration error on restricted frames
    }
  },

  /** Snappy double-click pulse for launching applications and major transitions */
  launch(): void {
    if (!hapticsEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate([10, 30, 14]);
    } catch {
      // Ignore
    }
  },

  /** Crisp single pulse for switches, checkmarks, and toggles (15ms) */
  toggle(): void {
    if (!hapticsEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore
    }
  },

  /** Soft release pulse when closing sheets, modals, or dismissing windows (12ms) */
  dismiss(): void {
    if (!hapticsEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore
    }
  },

  /** Heavy tactile thud for opening Control Center, drawer pulls, or system alerts */
  impact(): void {
    if (!hapticsEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate([18, 20, 24]);
    } catch {
      // Ignore
    }
  },
};

export default haptic;
