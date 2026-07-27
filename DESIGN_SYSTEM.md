# Design System Specification - Multiverse-OS

This document specifies the typography, colors, layout variables, and responsive standards that dictate the look and feel of the **Multiverse-OS** portfolio.

---

## 1. Visual Theme System

All values are declared as CSS variables in [styles/variables.css](file:///C:/Users/Suraj/multiverse-os/styles/variables.css) and mapped to tailwind utilities inside [styles/globals.css](file:///C:/Users/Suraj/multiverse-os/styles/globals.css).

```css
@theme {
  --color-bg-primary: var(--bg-primary);
  --color-bg-panel: var(--bg-panel);
  --color-bg-panel-hover: var(--bg-panel-hover);
  --color-accent-cyan: var(--accent-cyan);
  --color-accent-purple: var(--accent-purple);
  --color-success-green: var(--success-green);
  --color-warning-amber: var(--warning-amber);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border-subtle: var(--border-subtle);
  --color-border-bright: var(--border-bright);
}
```

---

## 2. Design Tokens

### 2.1. Color System (Default: Obsidian Dark)
| Variable | Value | CSS Custom Property | Rationale |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#030407` | `--bg-primary` | Root deep space backing. |
| **Panel Background** | `#0a0c16` | `--bg-panel` | Flat navy container backdrop. |
| **Hover Background** | `#111424` | `--bg-panel-hover` | Secondary hover trigger highlight. |
| **Accent Cyan** | `#00f2fe` | `--accent-cyan` | Interactive actions, active logs, focus indicators. |
| **Accent Purple** | `#a855f7` | `--accent-purple` | Achievements milestones, narrative markers. |
| **Text Primary** | `#ffffff` | `--text-primary` | Standard body headings & copy text. |
| **Text Secondary** | `#94a3b8` | `--text-secondary` | Muted labels, descriptive text. |
| **Border Subtle** | `#1e293b` | `--border-subtle` | Layout dividers. |
| **Border Bright** | `#334155` | `--border-bright` | Active inputs borders, hover selections. |

### 2.2. Spacing Scale
* **`xs`** (`4px` / `0.25rem`): Fine adjustments, metadata paddings.
* **`sm`** (`8px` / `0.5rem`): Inline buttons margins, details grid gap.
* **`md`** (`16px` / `1rem`): Standard layout gaps, card padding.
* **`lg`** (`24px` / `1.5rem`): Card columns gaps, outer borders spacing.
* **`xl`** (`32px` / `2rem`): Major layout block division paddings.
* **`xxl`** (`48px` / `3rem`): Section gaps.
* **`xxxl`** (`64px` / `4rem`): Outer page container gaps.

### 2.3. Typographic Hierarchy
* **Font Family**:
  * Sans-Serif: `Inter` (UI control buttons, descriptions copy).
  * Monospace: `JetBrains Mono` (Terminal inputs, chatbot logs).
* **Font Sizes**:
  * `xs` (`12px` / `0.75rem`) — Caption details.
  * `sm` (`14px` / `0.875rem`) — Dashboard data copy.
  * `base` (`16px` / `1rem`) — Body text.
  * `lg` (`18px` / `1.125rem`) — Card sub-headers.
  * `xl` (`20px` / `1.25rem`) — Widget headers.
  * `xxl` (`24px` / `1.5rem`) — Block headers.
  * `xxxl` (`32px` / `2rem`) — Module titles.
  * `display` (`48px` / `3rem`) — Page banners.
  * `hero` (`64px` / `4rem`) — Landing centerpiece title.

### 2.4. Border Radius
* `sm` (`4px`): Inputs, check boxes.
* `md` (`8px`): Tag pills, actionable buttons.
* `lg` (`12px`): Standard content cards.
* `xl` (`16px`): Nested panels, window containers.
* `full` (`9999px`): Avatars, round icons.

### 2.5. Z-Index Layering
* `sticky` (`50`): Sticky column menus.
* `footer` (`100`): Page footers.
* `navbar` (`200`): Main navigation header.
* `overlayBackground` (`1000`): Modal backdrop filters.
* `floatControls` (`9980`): Floating triggers (CLI & Oracle toggle bubbles).
* `fullscreenOverlay` (`9990`): Terminal window and Oracle sidebar drawer.
* `bootSequenceBlocker` (`9999`): Bios screen loader.

---

## 3. Theme Customizations

Theme selections modify the `data-theme` selector on the root document.

### 3.1. Cyberpunk Theme (`[data-theme="cyberpunk"]`)
* **Backgrounds**: Slate Purple (`#0a0512` / `#140b24`)
* **Accents**: Neon Pink (`#ff007f`) / Glowing Cyan (`#00f2fe`)
* **Shadows**: Vibrant magenta glow effects.

### 3.2. Matrix Theme (`[data-theme="matrix"]`)
* **Backgrounds**: Deep Forest Green (`#000a02` / `#001504`)
* **Accents**: Acid green (`#39ff14`) / Soft emerald (`#00ff66`)
* **Shadows**: Green scan lines shadows.

---

## 4. Accessibility Compliance

### 4.1. Reduced Motion Support
Under media query controls:
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-fast: 0s !important;
    --motion-duration-normal: 0s !important;
    --motion-duration-slow: 0s !important;
  }
}
```
All Framer Motion elements consume variables that adapt to these properties, disabling visual scale shifts for sensitive users.

### 4.2. High Contrast Theme (`[data-theme="high-contrast"]`)
Under system contrast settings or explicit selections:
* Backgrounds default to pure black (`#000000`).
* Borders convert to high-contrast white (`#ffffff`).
* Glow box-shadow elements are removed to prevent visual clutter and maintain readable text hierarchies.
