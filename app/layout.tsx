import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShellProvider from '@/components/ShellProvider';
import JsonLd from '@/components/JsonLd';
import { SharedLayout } from '@/layout';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#030407',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://surajdev.indevs.in'),
  title: {
    default: 'Suraj Samanta | Backend Developer & AI Engineer',
    template: '%s | Suraj Samanta',
  },
  description:
    'Official portfolio of Suraj Samanta (surajdev). Backend Developer & AI Engineer specializing in distributed systems, high-concurrency microservices (Spring Boot, Kafka, gRPC), TimescaleDB, and multi-agent AI orchestration.',
  applicationName: 'Suraj Samanta Multiverse OS',
  authors: [{ name: 'Suraj Samanta', url: 'https://surajdev.indevs.in' }],
  generator: 'Next.js',
  keywords: [
    'Suraj Samanta',
    'surajdev',
    'surajdev indevs',
    'surajdev.indevs.in',
    'Suraj-codes1410',
    'Suraj Samanta portfolio',
    'Suraj Samanta developer',
    'Suraj Samanta backend developer',
    'Suraj Samanta ADGITM',
    'Backend Developer',
    'AI Engineer',
    'Distributed Systems Engineer',
    'Spring Boot Microservices',
    'Apache Kafka',
    'gRPC Systems',
    'TimescaleDB Geospatial',
    'FastAPI Python',
    'Multiverse OS',
    'Software Engineer New Delhi',
  ],
  creator: 'Suraj Samanta',
  publisher: 'Suraj Samanta',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://surajdev.indevs.in',
    siteName: 'Suraj Samanta Portfolio | Multiverse OS',
    title: 'Suraj Samanta | Backend Developer & AI Engineer',
    description:
      'Official portfolio of Suraj Samanta (surajdev). High-performance distributed backend architectures, Kafka event queues, Spring Boot microservices, and multi-agent AI platforms.',
    images: [
      {
        url: '/profile.jpg',
        width: 800,
        height: 800,
        alt: 'Suraj Samanta - Backend Developer & AI Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suraj Samanta | Backend Developer & AI Engineer',
    description:
      'Explore the interactive Multiverse OS developer portfolio of Suraj Samanta (surajdev).',
    images: ['/profile.jpg'],
    creator: '@SurajSamanta',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/profile.jpg',
  },
  verification: {
    google: 'hBxHauBzemlMacZ1SWIuTJ7gn8szA_y0sfOfLopI3cM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <JsonLd />
        <ShellProvider>
          <SharedLayout>
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </SharedLayout>
        </ShellProvider>
      </body>
    </html>
  );
}
