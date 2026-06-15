'use client';

import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowUpRight } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import Card from './Card';

interface ContactCardProps {
  type: 'email' | 'linkedin' | 'github';
  value: string;
  label: string;
}

export default function ContactCard({ type, value, label }: ContactCardProps) {
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="w-6 h-6 text-accent-cyan" />;
      case 'linkedin':
        return <LinkedinIcon className="w-6 h-6 text-accent-purple" />;
      case 'github':
        return <GithubIcon className="w-6 h-6 text-text-primary" />;
    }
  };

  const getHref = () => {
    if (type === 'email') return `mailto:${value}`;
    return value;
  };

  const handleCopy = (e: React.MouseEvent) => {
    if (type === 'email') {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayValue = type === 'email' ? value : value.replace(/^https?:\/\/(www\.)?/, '');

  return (
    <a
      href={getHref()}
      target={type !== 'email' ? '_blank' : undefined}
      rel={type !== 'email' ? 'noopener noreferrer' : undefined}
      className="block group focus:outline-none"
    >
      <Card hoverable glowOnHover className="flex items-center justify-between p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center p-3 rounded-lg bg-bg-panel border border-border-subtle group-hover:border-accent-cyan/20 group-hover:shadow-[0_0_12px_rgba(0,242,254,0.1)] transition-all">
            {getIcon()}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
              {label}
            </span>
            <p className="text-sm md:text-base font-semibold text-text-primary mt-0.5 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {displayValue}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {type === 'email' && (
            <button
              onClick={handleCopy}
              className="p-2 text-text-secondary hover:text-accent-cyan transition-colors focus:outline-none"
              title="Copy email address"
              aria-label="Copy email address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-accent-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </Card>
    </a>
  );
}
