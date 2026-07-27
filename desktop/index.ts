// 1. Bridging exports from deprecated components folder to new Desktop architecture
export { default as RecruiterDashboard } from '@/components/RecruiterDashboard';
export { default as SkillsDashboard } from '@/components/SkillsDashboard';
export { default as GithubExplorer } from '@/components/GithubExplorer';
export { default as KnowledgeExplorerClient } from '@/components/KnowledgeExplorerClient';
export { default as CliTerminal } from '@/components/CliTerminal';
export { default as OracleWindow } from '@/components/OracleWindow';
export { default as GithubRepoDetail } from '@/components/GithubRepoDetail';
export { default as CareerTimeline } from '@/components/CareerTimeline';
export { default as MissionBriefing } from '@/components/MissionBriefing';
export { default as BootSequence } from '@/components/BootSequence';
export { default as HomeConsoleWidgets } from '@/components/HomeConsoleWidgets';

// 2. Desktop Shell Architecture Placeholders
export { DesktopShell } from './DesktopShell';
export type { DesktopShellProps } from './DesktopShell';
export { DesktopProvider } from './DesktopProvider';
export type { DesktopProviderProps } from './DesktopProvider';
export { DesktopContext, useDesktop } from './DesktopContext';
export type { DesktopState } from './DesktopContext';
export { WindowManager } from './WindowManager';
export type { WindowManagerProps } from './WindowManager';
export { DockProvider, useDock } from './DockProvider';
export type { DockState } from './DockProvider';
export { Wallpaper } from './Wallpaper';
export { windowRegistry } from './WindowRegistry';
export type { WindowMetadata } from './WindowRegistry';
export { RobotLayer } from './RobotLayer';
export { OracleLayer } from './OracleLayer';
export { WidgetLayer } from './WidgetLayer';
export { MenuBar } from './MenuBar';
export { Dock } from './Dock';
export type { DockProps, DockApp } from './Dock';
export { DesktopWindow } from './DesktopWindow';
export type { DesktopWindowProps } from './DesktopWindow';
