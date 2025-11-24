import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import Providers from './components/Providers';
import Script from 'next/script';
import ConsentAnalytics from './components/Privacy/ConsentAnalytics';
import CookieConsent from './components/Privacy/CookieConsent';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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
            <SidebarProvider>
              <div className="noise-overlay" />
              <div className="min-h-screen w-full flex bg-background text-foreground">
                <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="w-64">
                    <SidebarHeader>
                      <div className="flex items-center gap-3 px-2 py-2">
                        <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-8 w-auto rounded-lg" />
                        <div>
                          <span className="text-sm font-semibold">LofiStudio</span>
                          <span className="block text-[11px] text-muted-foreground uppercase tracking-widest">Focus Space</span>
                        </div>
                      </div>
                    </SidebarHeader>
                    <SidebarSeparator />
                    <SidebarContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild isActive>
                            <Link href="/studio">Studio</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <Link href="/about">About</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <Link href="/legal">Legales</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <Link href="/terms">Términos</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <Link href="/cookies">Cookies</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                      <div className="px-2 py-2">
                        <Button asChild className="w-full">
                          <Link href="/">Home</Link>
                        </Button>
                      </div>
                    </SidebarFooter>
                  </Sidebar>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="h-14 px-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SidebarTrigger className="h-11 w-11" />
                      </div>
                      <div className="flex items-center gap-2">
                        <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-7 w-auto rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 pt-14 lg:pt-0">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarProvider>
            <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="beforeInteractive" />
            <ConsentAnalytics />
            <CookieConsent />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
