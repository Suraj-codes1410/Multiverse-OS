# Phase 2.4 — Stateful Window Manager

This document tracks the execution of **Phase 2.4 — Stateful Window Manager** for the Multiverse-OS repository.

---

## 🖥️ Reusable Window Manager Architecture

We have built a stateful Window Manager under `/desktop` that supports unlimited draggable, resizable window frames.

### 1. Context and State Registry (`desktop/DesktopContext.ts`)
Standardizes properties for spawned window nodes:
```typescript
export interface WindowInstance {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}
```
Exposes state operations from the React hook context:
* `openWindow(id)` ── Launches a window instance and centers it with slight cascading offsets.
* `closeWindow(id)` ── Dismisses window view.
* `focusWindow(id)` ── Elevates a window's `zIndex` above other viewport panels.
* `minimizeWindow(id)` ── Suppresses display and de-focuses active selectors.
* `restoreWindow(id)` ── Re-opens a minimized window and restores focus.
* `maximizeWindow(id)` ── Toggles fullscreen mode (`100vw`/`100vh`).
* `updateWindowPosition(id, x, y)` ── Tracks dragging coordinates.
* `updateWindowSize(id, w, h)` ── Tracks resizing bounds.

### 2. Window UI Frame (`desktop/DesktopWindow.tsx`)
* **Headers Dragging**: Implements smooth coordinate tracking on mouse pointer moves. Limits dragging triggers to header bars (`cursor-move`), preventing drag conflicts when selecting text inside window bodies.
* **Corners Resizing**: Renders a custom diagonal pointer handler at the bottom right. Clamps size adjustments to minimum values (`min-width: 300px`, `min-height: 200px`) to preserve layout styling integrity.
* **Control Buttons**: Integrates action hooks (close, minimize, maximize) with active SVG icons mapping design tokens properties.

### 3. Desktop Workstation Mount (`desktop/DesktopShell.tsx`)
* **Connected Dock Actions**: Wrapped shell items inside a context listener wrapper. Clicking items on the applications toolbar automatically triggers `openWindow(appId)`, spawning window modules on the fly.
* **Sample Windows Templates**: Implemented two mock windows inside [desktop/WindowManager.tsx](file:///C:/Users/Suraj/multiverse-os/desktop/WindowManager.tsx) for testing:
  * **Sample Node Monitor (`sample-1`)**: Displays CPU activity status telemetries.
  * **System Telemetry Explorer (`sample-2`)**: Displays layout code highlights.

---

## 📊 Verification & Diagnostics

* **TypeScript type check**: Verified. Compiles with **0 compiler errors**.
* **ESLint checks**: Passed. **0 warnings or errors in new files**.
* **Next.js Production Build**: Compiled successfully.
* **Oracle Test Suite**: **37/37 tests passed**.

---

## ⚠️ Pre-Phase 2.5 Recommendations & Risks

* **Risk (Window boundaries clip outside viewports)**: Dragging windows beyond the browser frame can hide header bars, trapping window elements.
  * *Mitigation*: Position coordinate calculations inside `DesktopWindow` clamp offsets to viewport bounds (`window.innerWidth`, `window.innerHeight`).
* **Commit Notice**: **DO NOT COMMIT**. Staging changes in Git only; commits should be deferred until explicitly requested.
