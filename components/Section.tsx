'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
  delay = 0,
}: SectionProps) {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay }}
      >
        {(title || subtitle) && (
          <div className="mb-8 md:mb-12 max-w-3xl">
            {subtitle && (
              <p className="text-accent-cyan font-mono text-xs uppercase tracking-widest mb-2">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </motion.div>
    </section>
  );
}
