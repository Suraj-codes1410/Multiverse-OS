import React from 'react';
import Container from '@/components/Container';
import CareerTimeline from '@/components/CareerTimeline';
import { getTimeline } from '@/lib/data';

export const metadata = {
  title: 'Timeline | Suraj Samanta',
  description: "Explore Suraj Samanta's chronological career timeline, tracking projects, hackathons, and achievements.",
};

export default function TimelinePage() {
  const milestones = getTimeline();

  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-10 select-none">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            CHRONO_DATASTREAM
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Career Timeline
          </h1>
        </div>

        {/* Timeline Component */}
        <CareerTimeline milestones={milestones} />
      </Container>
    </div>
  );
}
