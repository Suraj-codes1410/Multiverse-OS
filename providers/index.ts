// 1. Bridging exports from deprecated components folder to new Providers architecture
export { default as ShellProvider } from '@/components/ShellProvider';
export * from '@/components/ShellProvider';

// 2. Shared Layout & Theme Providers Placeholders
export { LayoutProvider, useLayout } from './LayoutProvider';
export type { LayoutState } from './LayoutProvider';
export { ThemeProvider, useTheme } from './ThemeProvider';
export type { ThemeState } from './ThemeProvider';
export { ScrollProvider } from './ScrollProvider';
