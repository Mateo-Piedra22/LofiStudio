import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import Providers from './components/Providers';
import Script from 'next/script';
import ConsentAnalytics from './components/Privacy/ConsentAnalytics';
import CookieConsent from './components/Privacy/CookieConsent';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });



export const metadata: Metadata = {
  title: 'LofiStudio - Productivity & Lofi Music',
  description: 'Immersive productivity app with Lofi music, Pomodoro timer, and customizable widgets',
  keywords: ['lofi', 'productivity', 'pomodoro', 'focus', 'study', 'music'],
  generator: 'v0.app',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="noise-overlay" />
            {children}
            <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="beforeInteractive" />
            <ConsentAnalytics />
            <CookieConsent />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
