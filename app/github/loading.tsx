import React from 'react';
import Container from '@/components/Container';

export default function GithubLoading() {
  // Generate array of 6 skeleton cards
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="flex-grow py-8 font-sans">
      <Container>
        {/* Page Header Skeleton */}
        <div className="border-b border-border-subtle pb-6 mb-10 select-none animate-pulse">
          <div className="h-4 w-36 bg-border-subtle rounded mb-2" />
          <div className="h-10 w-64 bg-border-subtle rounded" />
        </div>

        {/* Filter Control Center Skeleton */}
        <div className="flex flex-col gap-4 bg-bg-panel border border-border-subtle p-5 rounded-2xl mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-9 bg-bg-primary border border-border-subtle rounded-lg flex-1" />
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-bg-primary border border-border-subtle rounded-lg" />
              <div className="h-9 w-36 bg-bg-primary border border-border-subtle rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border-subtle/30">
            <div className="h-4 w-12 bg-bg-primary rounded" />
            <div className="h-4 w-10 bg-bg-primary rounded" />
            <div className="h-4 w-16 bg-bg-primary rounded" />
            <div className="h-4 w-12 bg-bg-primary rounded" />
          </div>
        </div>

        {/* Telemetry Stream Header Skeleton */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-4 w-52 bg-bg-panel rounded" />
          <div className="h-4 w-28 bg-bg-panel rounded" />
        </div>

        {/* Cards Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletons.map((_, index) => (
            <div 
              key={index}
              className="bg-bg-panel/40 border border-border-subtle rounded-xl p-5 flex flex-col justify-between h-56 animate-pulse"
            >
              <div>
                {/* Header Skeleton */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="h-5 w-32 bg-border-subtle rounded" />
                  <div className="h-4 w-12 bg-border-subtle rounded" />
                </div>
                {/* Description Skeleton */}
                <div className="space-y-1.5 mb-4">
                  <div className="h-3 w-full bg-border-subtle/70 rounded" />
                  <div className="h-3 w-5/6 bg-border-subtle/70 rounded" />
                  <div className="h-3 w-4/6 bg-border-subtle/70 rounded" />
                </div>
                {/* Topics Skeleton */}
                <div className="flex gap-1.5 mb-4">
                  <div className="h-4 w-10 bg-border-subtle/50 rounded-full" />
                  <div className="h-4 w-12 bg-border-subtle/50 rounded-full" />
                  <div className="h-4 w-8 bg-border-subtle/50 rounded-full" />
                </div>
              </div>

              <div>
                {/* Specs Skeleton */}
                <div className="flex justify-between items-center pt-3 border-t border-border-subtle/30">
                  <div className="h-3.5 w-16 bg-border-subtle/50 rounded" />
                  <div className="h-3.5 w-24 bg-border-subtle/50 rounded" />
                </div>
                {/* Buttons Row Skeleton */}
                <div className="mt-3 pt-3 border-t border-border-subtle/20 flex gap-2">
                  <div className="h-6 bg-border-subtle/30 rounded flex-1" />
                  <div className="h-6 bg-border-subtle/30 rounded flex-1" />
                  <div className="h-6 w-8 bg-border-subtle/30 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
