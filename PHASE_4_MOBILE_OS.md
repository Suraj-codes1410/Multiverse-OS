# Phase 4 — Mobile Operating System

This document details the engineering specifications, runtime architecture, navigation maps, and layout paradigms of the **Suraj.OS Mobile Operating System (MobileShell)**.

---

### 1. Architecture Overview

Multiverse-OS features a dual-shell viewport design. Breakpoint triggers (monitored by the `LayoutProvider`) detect client resize actions and coordinate rendering states:

* **DesktopShell (>= 1024px)**: Renders absolute workspace coordinates, desktop folders, dynamic draggable windows, a bottom floating applications dock, and an interactive top menu bar.
* **MobileShell (< 1024px)**: Renders a smartphone shell emulator layout. Floating window chromes are replaced with a full-screen application stack, edge-swipe gesture interactions, a phone status bar, and a bottom tab control bar.

Both shells reuse the same underlying business logic, state contexts, data selectors, and API endpoints (Oracle, Contact form, and GitHub sync).

---

### 2. Navigation Paradigms

* **Bottom Tab Bar Controls (`BottomNavigation.tsx`)**:
  * Provides touch-optimized actions for standard viewport scopes: **Terminal**, **Home**, and **Oracle**.
  * Employs `framer-motion` layout transitions to sweep active indicator pills dynamically between active views.
* **Full-Screen App Stack (`HomeLayout.tsx`)**:
  * Selecting an application from the home screen grid slides up a dedicated, full-screen viewport.
  * Window titles are rendered in a minimal sans-serif top bar header accompanied by a touch-friendly **Back Button (`ChevronLeft`)**.
* **Edge Swipe Gestures (`GestureProvider.tsx`)**:
  * Implements custom React Touch listeners (`onTouchStart` and `onTouchEnd`).
  * Intercepts horizontal swipe-right gestures starting within `50px` of the left boundary of the screen (`diffX > 80px`, `diffY < 45px`) to dynamically trigger back transitions and close the current app.

---

### 3. Application Mapping

All desktop applications maps natively into Mobile views:

| Desktop App ID | Content View Component | Mobile Layout Details |
| :--- | :--- | :--- |
| `about` | `AboutAppContent` | Formatted bio details with single-column statistics lists. |
| `projects` | `ProjectsAppContent` | Single-column project grid with touch-expandable detail cards (`MissionBriefing`). |
| `skills` | `SkillsAppContent` | Mapped filtering list chips with adaptive skills relation maps. |
| `timeline` | `TimelineAppContent` | Dynamic scroll-down vertical timeline listing nodes. |
| `resume` | `ResumeAppContent` | PDF preview iframe rendering with a sticky "Download CV" button. |
| `contact` | `ContactAppContent` | Touch-first input fields, honeypots, and Send Message actions. |
| `recruiter` | `DashboardAppContent` | Candidate match analytics grid with one-tap query dispatchers. |
| `explorer` | `ExplorerAppContent` | Vertical folder hierarchy mapping repository files. |
| `settings` | `SettingsAppContent` | Touch setting grids for appearance themes. |

---

### 4. Shared Components & Design Sync

* **PastelOS Colors**: Mobile interfaces use warm ivory background planes (`bg-bg-panel`), deep graphite texts (`text-text-primary`), and terracotta triggers (`text-accent-cyan`).
* **Robot Companion**: Sitting natively as a header widget on the mobile Home screen. Blinks and bounces as an active helper mascot.
* **Shared Data Store**: Telemetry variables (CPU percentage, memory GB) dynamically fluctuate in the background widgets to mirror live machine status.

---

### 5. Diagnostics & Validation
* **ESLint checks**: 0 errors, clean output.
* **Production build tests**: Build completed successfully in Next.js Turbopack compiler.
* **Regression tests**: 37/37 tests passed.
