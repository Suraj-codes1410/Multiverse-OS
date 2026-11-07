import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suraj Samanta | Backend Developer & AI Engineer',
    short_name: 'surajdev',
    description:
      'Interactive Multiverse OS portfolio of Suraj Samanta, specializing in high-performance distributed backend architectures and scalable AI platforms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030407',
    theme_color: '#00f2fe',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
