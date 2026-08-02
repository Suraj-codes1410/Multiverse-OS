# Phase 2 Summary Report - Desktop OS Framework

This document outlines the architectural design system, runtime mechanics, visual elevations, accessibility compliance, and outstanding tech debt for the completed **Phase 2: Desktop OS Framework**.

---

## 🖥️ New Architecture & Desktop Layering

The Multiverse-OS desktop environment segregates visual components into clean, stacked layers. Z-index spacing ensures mouse interactions trigger correctly on foreground items (like dragging windows) while background layers remain click-through.

```
┌────────────────────────────────────────────────────────┐
│  Layer 6: Oracle Conversational Drawer Panel (z-[500])  │
├────────────────────────────────────────────────────────┤
│  Layer 5: Robot Automated Scanner Highlight (z-[100])  │
├────────────────────────────────────────────────────────┤
│  Layer 4: System Applications Dock Toolbar (z-[50])    │
├────────────────────────────────────────────────────────┤
│  Layer 3: Draggable Resizable Window Frames (z-[10+])  │
├────────────────────────────────────────────────────────┤
│  Layer 2: Selectable Icons Grid & Widgets (z-[10])     │
├────────────────────────────────────────────────────────┤
│  Layer 1: Fixed System Menu Bar Top Controls (z-[50])  │
├────────────────────────────────────────────────────────┤
│  Layer 0: Fullscreen Animated Wallpaper Canvas (z-[0])  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Window Runtime Explanation

Windows are managed dynamically via a central React Context state system:
* **Window Instances Registry**: Declarative configurations mapped in [WindowRegistry.ts](file:///C:/Users/Suraj/multiverse-os/desktop/WindowRegistry.ts) store initial dimensions and title markers.
* **Coordination State Hook**: [DesktopProvider.tsx](file:///C:/Users/Suraj/multiverse-os/desktop/DesktopProvider.tsx) implements hooks tracking window coordinates, sizes, active focus highlights, and min/max states.
* **Cascading Offsets**: When a window is opened, the manager cascades coordinates `(+35px, +35px)` relative to the existing windows to prevent full overlays.
* **Z-Index Elevation Stack**: A running `maxZIndex` state increments dynamically. Focusing a window increments `maxZIndex` and updates that window's z-index to bring it to the front.
* **Clamped Movement Handling**: Header mouse-down event listeners track movement coordinates, clamping values to keep window headers visible under the fixed 40px top menu bar.

---

## ⛵ Dock Runtime Explanation

The desktop Dock serves as the primary system launcher bar:
* **Active focused state**: A pulsing cyan indicator dot (`bg-accent-cyan shadow-[0_0_8px_var(--accent-cyan)]`) renders beneath the focused active application.
* **Running background applications**: A muted grey indicator dot (`bg-text-secondary/55`) highlights applications that are currently open in the background but not active/focused.
* **Click triggers**: Direct mapping from Dock items to `openWindow(appId)`. Clicking a minimized application restores and focuses it immediately.
* **Visual feedback**: Spring-based hover scaling (`hover:scale-125`) and click scaling (`active:scale-95`) provide immediate tactile response.

---

## 🎨 Wallpaper & Material Systems

### 1. Wallpaper System
* **Dynamic Canvas Particles**: An HTML5 Canvas renders animated grid matrices (Matrix rain theme), drifting network grids (default dark theme), or grid lines.
* **Readability Enhancements**: Canvas drawings are set to low opacity, layering behind soft CSS gradients (`bg-[radial-gradient(ellipse_at_center,var(--wallpaper-glow-primary),transparent_60%)]`) to prevent text readability issues.
* **Theme Synchronization**: The canvas automatically resets and redraws its particle structure to match active theme changes.

### 2. Material System & Elevation
We have introduced visual depth using distinct material layers and slate tones, avoiding pure black:
* **Wallpaper (Base)**: Soft radial gradients.
* **Desktop Workstation**: Glassmorphic panels with a low backing opacity (`bg-bg-panel/30 border-border-subtle/30 backdrop-blur-md`).
* **Active Windows**: Raised panels (`bg-bg-panel/75 backdrop-blur-xl border-accent-cyan/35 shadow-[0_20px_50px_rgba(0,242,254,0.15)]`).
* **Controls & Buttons**: Tactile glass elements (`bg-bg-primary/20 hover:bg-bg-panel-hover/60 border border-transparent hover:border-border-subtle/30`).

---

## ♿ Accessibility Notes

* **Keyboard Navigation**:
  * Desktop Icons and Dock items support full keyboard Tab focusing. Pressing `Enter` or `Space` selects and launches application windows.
  * Floating windows accept focus on Tab navigation. Focus states are visually indicated by glowing borders.
* **Screen Reader Integrity**: All visual shortcuts and controls contain semantic ARIA roles (`role="dialog"`, `role="toolbar"`, `role="grid"`, `aria-label`).
* **Reduced Motion Compliance**: The wallpaper canvas drawing loop and the Robot web-agent highlights loop detect OS-level `prefers-reduced-motion` settings and immediately freeze animations.

---

## ⚠️ Remaining Work Before Phase 3

* **Application Views Migration**: Migrate legacy pages (Projects, Timeline, About, Contact) into the Window Manager registry, replacing placeholders with high-fidelity React component viewports.
* **Window Snapping**: Integrate grid or screen corner snapping bounds when dragging window borders.
* **Code-Splitting Overlay Bundles**: Convert heavy overlay panels (e.g. CLI Terminal, Oracle chat) to lazy-loaded, dynamic imports to optimize site speed.
* **Clean Git Status**: Push staged files cleanly to the remote branch before beginning components refactoring.
