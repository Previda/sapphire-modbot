import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Sapphire ModBot - Ultra-Modern Discord Moderation',
  description: 'The most advanced Discord moderation bot with a stunning dashboard. Smooth, fast, and powerful.',
  keywords: ['discord', 'bot', 'moderation', 'dashboard', 'modern', 'advanced', 'smooth'],
  authors: [{ name: 'Sapphire Team' }],
  openGraph: {
    title: 'Sapphire ModBot - Ultra-Modern Discord Moderation',
    description: 'The most advanced Discord moderation bot with smooth animations and clean design',
    type: 'website',
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
