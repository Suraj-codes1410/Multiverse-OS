import React from 'react';
import { Mail, FileText } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import Container from './Container';
import { getPortfolio } from '@/lib/data';

export default function Footer() {
  const portfolio = getPortfolio();
  
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'github':
        return <GithubIcon className="w-4 h-4" />;
      case 'linkedin':
        return <LinkedinIcon className="w-4 h-4" />;
      case 'mail':
        return <Mail className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <footer className="border-t border-border-subtle bg-bg-primary/50 py-10 mt-auto">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} {portfolio.name}. All rights reserved.
            </p>
            <p className="text-xs text-text-secondary/50 font-mono mt-1.5">
              Multiverse OS • Phase 1 Foundation • Next.js + Tailwind CSS
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            {portfolio.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-subtle bg-bg-panel/40 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 hover:shadow-[0_0_10px_rgba(0,242,254,0.15)] transition-all"
                aria-label={link.platform}
              >
                {getIcon(link.icon)}
              </a>
            ))}
            
            <a
              href={portfolio.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-subtle bg-bg-panel/40 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 hover:shadow-[0_0_10px_rgba(0,242,254,0.15)] transition-all"
              aria-label="Download Resume"
              title="Download Resume"
            >
              <FileText className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
