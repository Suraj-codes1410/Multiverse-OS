import React from 'react';

export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'mono' | 'caption';
  children: React.ReactNode;
  className?: string;
}

export function Typography({
  variant = 'body',
  children,
  className = '',
}: TypographyProps) {
  const styles = {
    h1: 'text-3xl sm:text-5xl font-black uppercase tracking-tight text-text-primary',
    h2: 'text-2xl md:text-3xl font-bold tracking-tight text-text-primary',
    h3: 'text-lg font-bold text-text-primary',
    body: 'text-sm text-text-secondary leading-relaxed',
    mono: 'font-mono text-xs text-text-secondary',
    caption: 'text-xs text-text-secondary/50 font-mono tracking-wider',
  };

  const Component = {
    h1: 'h1' as const,
    h2: 'h2' as const,
    h3: 'h3' as const,
    body: 'p' as const,
    mono: 'code' as const,
    caption: 'span' as const,
  }[variant];

  return (
    <Component className={`${styles[variant]} ${className}`}>
      {children}
    </Component>
  );
}
