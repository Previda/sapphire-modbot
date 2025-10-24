import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://skyfall-omega.vercel.app'),
  title: 'Sapphire ModBot - Professional Discord Management',
  description: 'Advanced Discord moderation bot with beautiful dashboard, real-time monitoring, and powerful features.',
  keywords: ['discord', 'bot', 'moderation', 'dashboard', 'modern', 'advanced', 'management'],
  authors: [{ name: 'Sapphire Team' }],
  openGraph: {
    title: 'Sapphire ModBot - Professional Discord Management',
    description: 'Advanced Discord moderation bot with beautiful dashboard, real-time monitoring, and powerful features.',
    type: 'website',
    url: 'https://skyfall-omega.vercel.app',
    siteName: 'Sapphire ModBot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sapphire ModBot - Professional Discord Management',
    description: 'Advanced Discord moderation bot with beautiful dashboard',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
