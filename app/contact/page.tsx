'use client';

import React, { useState } from 'react';
import { Send, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ContactCard from '@/components/ContactCard';
import { getPortfolio } from '@/lib/data';

export default function ContactPage() {
  const portfolio = getPortfolio();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          honeypot,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setHoneypot('');
      } else {
        setErrorMessage(data.message || 'An error occurred while sending the message.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-12">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            COMMUNICATION_CHANNEL
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Contact Candidate
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Direct Links */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Establish Connection
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 font-light">
                Feel free to reach out for project collaborations, job opportunities, or system architecture consultations. You can copy the email directly or connect via social networks.
              </p>
            </div>

            <div className="space-y-4">
              <ContactCard
                type="email"
                value={portfolio.email}
                label="Direct Email"
              />
              <ContactCard
                type="linkedin"
                value={portfolio.linkedin}
                label="LinkedIn Profile"
              />
              <ContactCard
                type="github"
                value={portfolio.github}
                label="GitHub Repositories"
              />
            </div>

            {/* Resume Download Box */}
            <Card hoverable={false} className="bg-bg-panel/40 border-dashed border-border-bright/50 p-5 mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-accent-cyan" /> Technical CV / Resume
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">
                    Download the latest version of Suraj Samanta&apos;s technical resume containing detailed histories, architectures, and academic credentials.
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-text-secondary">
                    <span>LAST_UPDATED: June 21, 2026</span>
                    <span className="text-border-subtle">|</span>
                    <span>FILE_SIZE: 625 KB</span>
                  </div>
                </div>
                <Button href={portfolio.resume} target="_blank" variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0 w-full sm:w-auto">
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Download Resume
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Contact Form */}
          <Card hoverable={false} className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-cyan" /> Secure Message Transmission
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="form-name" className="block text-xs font-mono text-text-secondary uppercase">
                    Sender Name *
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary placeholder-text-secondary/35 focus:border-accent-cyan/80 focus:shadow-[0_0_12px_rgba(0,242,254,0.1)] focus:outline-none transition-all"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="form-email" className="block text-xs font-mono text-text-secondary uppercase">
                    Sender Email *
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary placeholder-text-secondary/35 focus:border-accent-cyan/80 focus:shadow-[0_0_12px_rgba(0,242,254,0.1)] focus:outline-none transition-all"
                    placeholder="e.g. name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-subject" className="block text-xs font-mono text-text-secondary uppercase">
                  Subject
                </label>
                <input
                  id="form-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary placeholder-text-secondary/35 focus:border-accent-cyan/80 focus:shadow-[0_0_12px_rgba(0,242,254,0.1)] focus:outline-none transition-all"
                  placeholder="e.g. Infrastructure Project Proposal"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-message" className="block text-xs font-mono text-text-secondary uppercase">
                  Message Payload *
                </label>
                <textarea
                  id="form-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary placeholder-text-secondary/35 focus:border-accent-cyan/80 focus:shadow-[0_0_12px_rgba(0,242,254,0.1)] focus:outline-none transition-all resize-none"
                  placeholder="Type your message details here..."
                />
              </div>

              {/* Bot honeypot spam-trap field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {isSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success-green/10 border border-success-green/20 text-success-green font-mono text-xs">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>SUCCESS: Message sent. Thank you, I will get back to you shortly!</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-xs">
                  <span className="font-bold flex-shrink-0">ERROR:</span>
                  <span>{errorMessage}</span>
                </div>
              )}


              <Button
                type="submit"
                disabled={isSubmitting || !name || !email || !message}
                variant="primary"
                className="w-full font-mono text-xs tracking-wider"
              >
                {isSubmitting ? (
                  <>TRANSMITTING...</>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2" /> SEND_MESSAGE
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
