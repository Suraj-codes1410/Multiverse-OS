# Phase 3.5 — PastelOS Visual System Design System

This document outlines the visual system, architecture, and theme tokens implemented to redefine the identity of **Suraj.OS** into a warm, minimal, and editorial desktop environment inspired by classic Macintosh, Arc Browser, and Raycast.

---

### 1. Final Color Palette (PastelOS)

The system color palette uses highly restrained, muted pastel colors with controlled contrast to support readability and calm interaction focus.

| Token | Variable | Value | Role |
| :--- | :--- | :--- | :--- |
| **Desktop Background** | `--bg-primary` | `#DCEBE8` | Soft pastel blue-green background canvas |
| **Window Background** | `--bg-panel` | `#F7F2EB` | Warm ivory/cream window surface |
| **Window Hover** | `--bg-panel-hover` | `#ECE6DC` | Slightly darker warm beige on hover |
| **Card Background** | `--card-bg` | `#FFFFFF` | Premium solid paper white for distinct elevation |
| **Accent Color** | `--accent-cyan` | `#E06A3F` | Premium terracotta/clay accent for focus and CTAs |
| **Secondary Accent** | `--accent-purple` | `#8FA6B2` | Understated dusty blue for active secondary highlights |
| **Success** | `--success-green` | `#7D8C77` | Muted olive green for nominal operational indicators |
| **Warning** | `--warning-amber` | `#D1A25E` | Soft golden amber for alert states |
| **Error** | (System Red) | `#C85B53` | Muted brick red for failover telemetry indicators |
| **Primary Text** | `--text-primary` | `#2B2D2F` | Deep graphite/charcoal (not pure black) |
| **Secondary Text** | `--text-secondary`| `#6A6D70` | Warm neutral gray for metadata labels |

---

### 2. Material System & Spacing

* **Window Material**: Replaced semi-transparent glass with solid **warm ivory (`#F7F2EB`)** for application windows to enforce reading clarity. Glassmorphism backdrop-blurs are reserved strictly for floating system panels (Dock, Menu Bar, Tooltips) to denote overlay height.
* **Editorial Grid Spacing**:
  * Increased window chrome header height from `36px` to `44px` (`h-11`) to provide premium header margins.
  * Inner application body padding expanded to `p-5` to create clean white space.
  * Desktop icons grid expanded with larger column and row gaps (`gap-x-5 gap-y-4`) to optimize layout balance.

---

### 3. Shadow System & Elevation Hierarchy

Rather than using dramatic custom drop shadows, the system maps shadows through custom CSS theme custom properties. The hierarchy establishes depth as follows:

```
[Layer 0] Desktop Background 
   │
[Layer 1] Widgets / Shortcuts (shadow-sm: Subtle depth)
   │
[Layer 2] Windows (shadow-md: Regular elevation)
   │
[Layer 3] Focus Active Window (shadow-xl / ring-1: Accent highlight elevation)
   │
[Layer 4] Floating Overlays & Dock (shadow-xl / backdrop-blur-md)
```

---

### 4. Typography Hierarchy

* **Sans-Serif Alignment**: Transitioned the window title headers and desktop icon labels from monospaced (`font-mono`) to sans-serif (`font-sans font-medium text-xs tracking-tight`) to evoke classic Macintosh and editorial design qualities.
* **Dual Weight Hierarchy**: Emphasizes labels using varying weights (`font-medium` / `font-bold`) and lighter opacity variables rather than using conflicting colors.

---

### 5. Wallpaper & Companion Philosophy

* **Mesh Canvas Blobs**: The active wallpaper canvas utilizes 4 large, soft-gradient blobs (`rgba(198, 222, 217, 0.45)`, `rgba(239, 233, 222, 0.45)`, etc.) that drift and bounce slowly in the background, simulating a fluid mesh background with zero visual noise.
* **Paper-Grain Texture**: Added a low-opacity base64 SVG fractal noise filter layer overlays above the gradient background, giving the canvas a tactile, high-end organic paper-like quality.
* **Friendly companion**: Replaced the technical Eye icon in the status bar with a handcrafted, interactive SVG robot companion featuring blinking terracotta eyes, a white head, warm gray outlines, and a friendly smile.

---

### 6. Theme Token Override Maps

Theme selections are completely modular. When the user switches themes, the CSS Custom Properties are updated:

```css
/* PastelOS Default (variables.css) */
:root {
  --bg-primary: #DCEBE8;
  --bg-panel: #F7F2EB;
  --card-bg: #FFFFFF;
  --accent-cyan: #E06A3F;
  --window-bg: var(--bg-panel);
  --terminal-bg: #FAF6EE;
  ...
}

/* Obsidian Dark Override (theme.css) */
[data-theme="dark"] {
  --bg-primary: #030407;
  --bg-panel: #0a0c16;
  --card-bg: #111424;
  --accent-cyan: #00f2fe;
  --terminal-bg: #030407;
  ...
}
```

---

### 7. Design Rationale

PastelOS moves Suraj.OS away from typical gamified, high-contrast dark dashboards towards a professional, tactile workspace. The terracotta accent represents structure, while the warm cream window planes and paper-grain textures build a quiet, sophisticated backdrop that keeps the content and code the main focus.
