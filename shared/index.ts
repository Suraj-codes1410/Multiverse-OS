// Core Shared UI Architecture Exports

// 1. Newly created atomic components
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Panel } from './Panel';
export type { PanelProps } from './Panel';

export { GlassPanel } from './GlassPanel';
export type { GlassPanelProps } from './GlassPanel';

export { WindowFrame } from './WindowFrame';
export type { WindowFrameProps } from './WindowFrame';

export { WindowHeader } from './WindowHeader';
export type { WindowHeaderProps } from './WindowHeader';

export { Typography } from './Typography';
export type { TypographyProps } from './Typography';

export { Section } from './Section';
export type { SectionProps } from './Section';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Chip } from './Chip';
export type { ChipProps } from './Chip';

export { Icon } from './Icon';
export type { IconProps } from './Icon';

export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { Container } from './Container';
export type { ContainerProps } from './Container';

export { Scrollbar } from './Scrollbar';
export type { ScrollbarProps } from './Scrollbar';

// 2. Bridging exports for remaining legacy shared components
export { default as MarkdownRenderer } from '@/components/MarkdownRenderer';
export { default as ProjectCard } from '@/components/ProjectCard';
export { default as GithubRepoCard } from '@/components/GithubRepoCard';
export { default as TimelineItem } from '@/components/TimelineItem';
export { default as SkillCard } from '@/components/SkillCard';
export { default as SkillRelationships } from '@/components/SkillRelationships';
export * from '@/components/Icons';
