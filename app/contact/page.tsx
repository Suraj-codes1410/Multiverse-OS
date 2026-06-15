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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    Looking for a CV/Resume?
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Download the latest version of Suraj Samanta's technical resume containing detailed histories, architectures, and academic credentials.
                  </p>
                </div>
                <Button href={portfolio.resume} target="_blank" variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> RESUME.PDF
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

              {isSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success-green/10 border border-success-green/20 text-success-green font-mono text-xs">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>SUCCESS: Message sent. Thank you, I will get back to you shortly!</span>
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
