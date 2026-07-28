'use client';

import React from 'react';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  href?: string;
  target?: string;
  rel?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  href,
  target,
  rel,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    primary: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 hover:bg-accent-cyan/20 hover:border-accent-cyan/60 hover:shadow-sm font-semibold',
    secondary: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/25 hover:bg-accent-purple/20 hover:border-accent-purple/60',
    outline: 'border border-border-subtle bg-card-bg text-text-primary hover:bg-bg-panel-hover/40 hover:border-border-bright shadow-sm',
    tertiary: 'text-text-secondary hover:text-text-primary bg-transparent border border-transparent',
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        <Link href={href} className={combinedStyles} target={target} rel={rel}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={combinedStyles}
      {...props}
    >
      {children}
    </motion.button>
  );
}
