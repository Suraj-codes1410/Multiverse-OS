// 1. Bridging exports from deprecated components folder to new Layout architecture
export { default as Container } from '@/components/Container';
export { default as Section } from '@/components/Section';
export { default as Footer } from '@/components/Footer';
export { default as Navbar } from '@/components/Navbar';

// 2. Shared Layout Architecture Placeholders
export { SharedLayout } from './SharedLayout';
export type { SharedLayoutProps } from './SharedLayout';
