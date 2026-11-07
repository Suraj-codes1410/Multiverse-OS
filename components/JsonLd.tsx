import React from 'react';

export default function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://surajdev.indevs.in/#person',
        name: 'Suraj Samanta',
        alternateName: [
          'surajdev',
          'surajdev.indevs.in',
          'Suraj Codes',
          'Suraj-codes1410',
          'Suraj Samanta ADGITM',
          'Suraj Samanta Backend Developer',
        ],
        url: 'https://surajdev.indevs.in',
        image: 'https://surajdev.indevs.in/profile.jpg',
        jobTitle: 'Backend Developer & AI Engineer',
        worksFor: {
          '@type': 'Organization',
          name: 'Distributed Systems & Software Engineering',
        },
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'Dr. Akhilesh Das Gupta Institute of Professional Studies',
          location: 'New Delhi, India',
        },
        email: 'mailto:samantasuraj1410@gmail.com',
        sameAs: [
          'https://github.com/Suraj-codes1410',
          'https://www.linkedin.com/in/suraj-samanta1410/',
          'https://surajdev.indevs.in',
        ],
        knowsAbout: [
          'Backend Engineering',
          'Distributed Systems',
          'Microservices Architecture',
          'Spring Boot',
          'Apache Kafka',
          'gRPC',
          'FastAPI',
          'Python',
          'Java',
          'Docker',
          'PostgreSQL',
          'TimescaleDB',
          'Artificial Intelligence',
          'Next.js',
          'Multiverse OS',
        ],
        description:
          'Suraj Samanta is a Backend Developer and AI Engineer specializing in high-throughput microservices, distributed event streaming with Kafka, gRPC architectures, and multi-agent AI orchestration.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://surajdev.indevs.in/#website',
        url: 'https://surajdev.indevs.in',
        name: 'Suraj Samanta Portfolio | Multiverse OS',
        alternateName: ['surajdev', 'surajdev.indevs.in', 'Suraj Samanta'],
        description:
          'Interactive Multiverse OS desktop and mobile developer portfolio of Suraj Samanta, Backend Developer & AI Engineer.',
        publisher: {
          '@id': 'https://surajdev.indevs.in/#person',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'ProfilePage',
        '@id': 'https://surajdev.indevs.in/#profilepage',
        url: 'https://surajdev.indevs.in',
        name: 'Suraj Samanta | Backend Developer & AI Engineer',
        isPartOf: {
          '@id': 'https://surajdev.indevs.in/#website',
        },
        about: {
          '@id': 'https://surajdev.indevs.in/#person',
        },
        mainEntity: {
          '@id': 'https://surajdev.indevs.in/#person',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
