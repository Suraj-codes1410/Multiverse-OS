import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackText?: string;
  className?: string;
}

export function Avatar({
  src,
  alt = 'Profile Avatar',
  size = 'md',
  fallbackText = 'U',
  className = '',
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border border-border-subtle bg-bg-panel text-text-primary font-mono select-none ${sizeStyles[size]} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallbackText.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
