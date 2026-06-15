import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BootSequence from '@/components/BootSequence';
import ShellProvider from '@/components/ShellProvider';
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

export const metadata: Metadata = {
  title: 'Suraj Samanta | Backend Developer & AI Engineer',
  description: 'Portfolio of Suraj Samanta, specializing in high-performance distributed backend architectures, scalable data systems, and multi-agent AI orchestration.',
  authors: [{ name: 'Suraj Samanta' }],
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
        <ShellProvider>
          <BootSequence />
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </ShellProvider>
      </body>
    </html>
  );
}
