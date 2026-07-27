import React from 'react';
import { LucideProps } from 'lucide-react';

export interface IconProps {
  icon: React.ComponentType<LucideProps>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'primary' | 'secondary';
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  color = 'primary',
  className = '',
}: IconProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const colorClasses = {
    cyan: 'text-accent-cyan',
    purple: 'text-accent-purple',
    success: 'text-success-green',
    warning: 'text-warning-amber',
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
  };

  return (
    <IconComponent className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
}
export default Icon;
