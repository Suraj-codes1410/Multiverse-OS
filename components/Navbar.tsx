'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldAlert } from 'lucide-react';
import Button from './Button';
import Container from './Container';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, 0);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Skills', href: '/skills' },
    { name: 'Projects', href: '/projects' },
    { name: 'Timeline', href: '/timeline' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-primary/70 backdrop-blur-md transition-all duration-300">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-2 font-semibold text-text-primary hover:text-accent-cyan transition-colors focus:outline-none"
            aria-label="Suraj Samanta Home"
          >
            <span className="font-mono text-xs text-accent-cyan tracking-tighter">SUR_</span>
            <span className="tracking-wide text-sm font-bold uppercase">Samanta</span>
            <span className="hidden sm:inline font-mono text-[9px] bg-border-subtle px-1.5 py-0.5 rounded text-text-secondary border border-border-subtle/50 ml-1">
              OS.v1
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Desktop Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors focus:outline-none relative py-1 ${
                  isActive(link.href)
                    ? 'text-text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-4">
            <Button href="/recruiter" variant="primary" size="sm">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              Recruiter Mode
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden items-center justify-center p-2 text-text-secondary hover:text-text-primary focus:outline-none"
            aria-expanded={isOpen}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border-subtle bg-bg-primary/95 backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 p-6" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-base py-2 transition-colors ${
                  isActive(link.href)
                    ? 'text-accent-cyan font-medium border-l-2 border-accent-cyan pl-2'
                    : 'text-text-secondary hover:text-text-primary pl-2'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
              <Button href="/recruiter" variant="primary" className="w-full">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Recruiter Mode
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
