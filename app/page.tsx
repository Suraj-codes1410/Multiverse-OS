import React from 'react';
import ClientHomePage from '@/components/ClientHomePage';
import { getPortfolio, getFeaturedProjects } from '@/lib/data';

/**
 * HomePage server entry point.
 * Fetches portfolio records and passes them to ClientHomePage to render shells.
 */
export default async function HomePage() {
  const portfolio = getPortfolio();
  const featuredProjects = await getFeaturedProjects();

  return (
    <ClientHomePage portfolio={portfolio} featuredProjects={featuredProjects} />
  );
}
