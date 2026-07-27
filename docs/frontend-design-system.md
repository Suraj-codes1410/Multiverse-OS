# Frontend Design System & Tech Stack Specifications

This document provides a detailed breakdown of the frontend tech stack, color palette configurations, typography, and visual assets used to build the **Multiverse-OS** user interface.

---

## 🎨 Visual Color Palette & Design Tokens

Multiverse-OS implements a **sleek dark mode design system** inspired by cyberpunk terminal interfaces, matrix consoles, and modern glassmorphism. All visual design tokens are defined in the Tailwind CSS theme config within `app/globals.css`.

### Core Color Palette

| Token Name | Hex Value | Tailwind Class | Architectural Role & Usage |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#030407` | `bg-bg-primary` | Base body background (deep midnight obsidian). |
| **Panel Background** | `#0a0c16` | `bg-bg-panel` | Card, container, and window backgrounds (dark slate navy). |
| **Panel Hover** | `#111424` | `bg-bg-panel-hover` | Interactive card state highlighting on hover. |
| **Accent Cyan** | `#00f2fe` | `text-accent-cyan` / `border-accent-cyan` | Interactive triggers, primary buttons, borders, CLI commands, and glowing indicators. |
| **Accent Purple** | `#a855f7` | `text-accent-purple` | Secondary highlights, special stats, and deep-tech indicators. |
| **Success Green** | `#10b981` | `text-success-green` | Active service indicators, valid analytics states, and healthy sync metrics. |
| **Warning Amber** | `#f59e0b` | `text-warning-amber` | Alert messages, rate limit failovers, and minor API degradation warnings. |
| **Text Primary** | `#ffffff` | `text-text-primary` | High-contrast copy text and headings. |
| **Text Secondary** | `#94a3b8` | `text-text-secondary` | Muted slate copy for metadata, labels, and descriptions. |
| **Subtle Border** | `#1e293b` | `border-border-subtle` | Fine divider borders for containers and standard table structures. |
| **Bright Border** | `#334155` | `border-border-bright` | High-contrast borders indicating panel focus or hover states. |

### Visual Effects & UI Accents

1. **Cyberpunk Glow (Cyan Shadow)**:
   Used to emphasize interactive controls and buttons:
   ```css
   box-shadow: 0 0 10px rgba(0, 242, 254, 0.15);
   ```
2. **Glassmorphism**:
   Created by coupling translucent panel backgrounds with backdrop-filters and subtle borders:
   ```html
   <div class="bg-bg-panel/40 border border-border-subtle/50 backdrop-blur-md">...</div>
   ```
3. **Scrollbar Design**:
   Premium custom scrollbars styled to fit the midnight palette, fading into active cyan thumb glows on hover.

---

## 🔤 Typography & Font Systems

Typography is loaded dynamically using Next.js Google Fonts optimization to guarantee high-performance rendering and fallback behaviors.

| Font Family | CSS Variable | Usage Context | Styling Objective |
| :--- | :--- | :--- | :--- |
| **Inter** | `--font-inter` | Body text, dashboards, copy text, headings | Clean, highly legible, professional sans-serif system. |
| **JetBrains Mono** | `--font-jetbrains-mono` | UNIX terminal, analytics panels, code snippets, logs | Tech-focused, highly structured monospace system. |

---

## 🛠️ Frontend Technical Stack

Multiverse-OS uses a modern, high-performance web development stack designed to ensure sub-second page loads, strong type-safety, and fluid interaction.

### 1. Core Frameworks & Runtime

* **Next.js (v16.2.9)**:
  * Utilizes **App Router** to support layout nesting and route segments.
  * Combines **React Server Components (RSC)** for fast first-paint static pages (e.g. `/about`, `/projects`, `/skills`) with client-side hydration for dynamic systems.
  * Features serverless optimization on Vercel utilizing Edge middleware and optimized dynamic caching headers.
* **React (v19.2.4)**:
  * Leverages the latest React 19 runtime APIs for concurrent rendering and state lifecycle hooks.
* **TypeScript (v5.x)**:
  * Strict compilation check guarantees no type conflicts, clean prop definitions, and structural safety across component APIs.

### 2. Styling & Animation Engines

* **Tailwind CSS (v4.0.0)**:
  * Utilizes the new CSS-first engine. Configured with a `@theme` CSS layer mapping variable design tokens instead of a legacy `tailwind.config.js`.
* **Framer Motion (v12.40.0)**:
  * Handles interactive desktop transition animations, command execution logs scrolling transitions, modal overlays, and dashboard fade-ins.
* **Lucide React (v1.18.0)**:
  * Rich vector asset library supplying clean, uniform, and light-weight developer iconography.

### 3. Global State Providers

* **`ShellProvider`**:
  * Client-side React context provider maintaining the internal state of the CLI window (whether minimized, maximized, theme settings, command history list, cache entries, etc.).
* **`BootSequence`**:
  * An interactive sequence simulating retro-BIOS hardware configuration scans, memory tests, and system initialization routines prior to exposing the actual portfolio view.
