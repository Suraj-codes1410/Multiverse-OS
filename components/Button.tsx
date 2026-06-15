'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    primary: 'bg-transparent text-accent-cyan border border-accent-cyan/30 hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,242,254,0.25)] text-shadow-[0_0_10px_rgba(0,242,254,0.4)]',
    secondary: 'bg-transparent text-accent-purple border border-accent-purple/30 hover:border-accent-purple hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    outline: 'border border-border-subtle bg-bg-panel/40 text-text-primary hover:bg-bg-panel/80 hover:border-border-bright',
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
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
