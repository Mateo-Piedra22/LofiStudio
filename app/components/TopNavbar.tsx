'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import ThemeSelector from '@/app/components/Settings/ThemeSelector';
import { Menu, Maximize2, Minimize2, Eye, EyeOff, Settings, Home, User, Waves, Image as ImageIcon, Palette, Layout, BarChart3, Keyboard, X } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import UserAuth from '@/app/components/UserAuth';

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'auto'>('theme', 'dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [glass] = useLocalStorage<number>('glassOpacity', 0.4);
  const [isEditing, setIsEditing] = useState(false);
  const [showHeaders, setShowHeaders] = useLocalStorage('showWidgetHeaders', true);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    } else {
      try { document.documentElement.requestFullscreen(); } catch {}
    }
  };

  const toggleZen = () => {
    try { window.dispatchEvent(new Event('toggle-zen-mode')); } catch {}
    setOpen(false);
  };

  const openSettings = () => {
    try { window.dispatchEvent(new Event('open-settings')); } catch {}
    setOpen(false);
  };

  const openAmbientMixer = () => {
    try { window.dispatchEvent(new Event('open-ambient-mixer')); } catch {}
    setOpen(false);
  };

  const openBackgroundSelector = () => {
    try { window.dispatchEvent(new Event('open-background-selector')); } catch {}
    setOpen(false);
  };

  const minGlass = Math.max(0.25, Math.min(1, glass));

  useEffect(() => {
    const onEditState = (e: any) => {
      try { setIsEditing(!!(e?.detail ?? false)); } catch {}
    };
    window.addEventListener('editing-layout-change', onEditState as any);
    return () => window.removeEventListener('editing-layout-change', onEditState as any);
  }, []);

  const toggleEditLayout = () => {
    try { window.dispatchEvent(new Event('toggle-edit-layout')); } catch {}
    setOpen(false);
  };

  const openWidgetManager = () => {
    try { window.dispatchEvent(new Event('open-widget-manager')); } catch {}
    setOpen(false);
  };

  const toggleHeaders = () => {
    try { window.dispatchEvent(new Event('toggle-hide-headers')); } catch {}
    setShowHeaders(!showHeaders);
  };

  const reauth = () => {
    try { window.dispatchEvent(new Event('open-reauth')); } catch {}
    setOpen(false);
  };

  return (
    <div className={`fixed top-0 z-50 w-full ${isEditing ? 'opacity-0 pointer-events-none' : ''}`} style={{ pointerEvents: 'none' }}>
      <div className="px-4 md:px-6">
        <div className="h-16 flex items-center">
          <div className="flex items-center gap-2 glass-panel rounded-full border px-2 py-1" style={{ pointerEvents: 'auto', ['--glass-opacity' as any]: String(minGlass) }}>
            <Link href="/" className="flex items-center gap-2">
              <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-9 w-auto rounded-md shadow-md" />
              <span className="text-foreground text-lg font-bold tracking-wide">LofiStudio</span>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="lg" className="h-10 rounded-full text-foreground">
                  <AnimatedIcon animationSrc="/lottie/Menu.json" fallbackIcon={Menu} className="w-6 h-6" />
                  <span className="ml-2">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/90 backdrop-blur-md border-l border-white/10 text-white w-[520px] lg:w-[600px] xl:w-[640px] max-w-[92vw] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="flex flex-col gap-6 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-8 w-auto rounded-md" />
                    <span className="text-white text-base font-semibold">Control Center</span>
                  </div>
                  <div className="flex items-center">
                    <UserAuth />
                  </div>
                </div>
                <Separator className="bg-white/10" />

                <div className="space-y-3">
                  <div className="text-sm uppercase tracking-wider text-white/60">Ambient Sounds</div>
                  <div className="flex items-center gap-3">
                    <Button onClick={openAmbientMixer} className="rounded-full">
                      <AnimatedIcon animationSrc="/lottie/Waves.json" fallbackIcon={Waves} className="w-5 h-5" />
                      <span className="ml-2">Open Mixer</span>
                    </Button>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3">
                  <div className="text-sm uppercase tracking-wider text-white/60">Visuals</div>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={openBackgroundSelector} className="rounded-full">
                      <AnimatedIcon animationSrc="/lottie/Image.json" fallbackIcon={ImageIcon} className="w-5 h-5" />
                      <span className="ml-2">Background</span>
                    </Button>
                    <Button variant="outline" className="rounded-full border-white/20 text-white/90">
                      <AnimatedIcon animationSrc="/lottie/Palette.json" fallbackIcon={Palette} className="w-5 h-5" />
                      <span className="ml-2">Theme</span>
                    </Button>
                  </div>
                  <div className="mt-2">
                    <ThemeSelector theme={theme} setTheme={setTheme} />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                 <div className="space-y-3">
                   <div className="text-sm uppercase tracking-wider text-white/60">Tools</div>
                   <div className="grid grid-cols-2 gap-2">
                     <Button variant="ghost" onClick={toggleFullscreen} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc={isFullscreen ? '/lottie/Minimize2.json' : '/lottie/Maximize2.json'} fallbackIcon={isFullscreen ? Minimize2 : Maximize2} className="w-5 h-5" />
                       <span className="ml-2">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                     </Button>
                     <Button variant="ghost" onClick={toggleZen} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc="/lottie/EyeOff.json" fallbackIcon={EyeOff} className="w-5 h-5" />
                       <span className="ml-2">Focus Mode</span>
                     </Button>
                     <Button variant="ghost" onClick={toggleEditLayout} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc="/lottie/Layout.json" fallbackIcon={Layout} className="w-5 h-5" />
                       <span className="ml-2">Edit Layout</span>
                     </Button>
                     <Button variant="ghost" onClick={openWidgetManager} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc="/lottie/Layout.json" fallbackIcon={Layout} className="w-5 h-5" />
                       <span className="ml-2">Add Widgets</span>
                     </Button>
                     <Button variant="ghost" onClick={toggleHeaders} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc={showHeaders ? '/lottie/EyeOff.json' : '/lottie/Eye.json'} fallbackIcon={showHeaders ? EyeOff : Eye} className="w-5 h-5" />
                       <span className="ml-2">{showHeaders ? 'Hide Headers' : 'Show Headers'}</span>
                     </Button>
                     <Button variant="ghost" onClick={() => { try { window.dispatchEvent(new Event('open-stats')); } catch {} setOpen(false); }} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc="/lottie/BarChart3.json" fallbackIcon={BarChart3} className="w-5 h-5" />
                       <span className="ml-2">Stats</span>
                     </Button>
                     <Button variant="ghost" onClick={() => { try { window.dispatchEvent(new Event('open-logs')); } catch {} setOpen(false); }} className="rounded-full text-white/90 justify-start">
                       <AnimatedIcon animationSrc="/lottie/Keyboard.json" fallbackIcon={Keyboard} className="w-5 h-5" />
                       <span className="ml-2">Activity Log</span>
                     </Button>
                   </div>
                 </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3">
                  <div className="text-sm uppercase tracking-wider text-white/60">Links</div>
                  <div className="grid grid-cols-3 gap-3">
                    <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <button onClick={openSettings} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                    <button onClick={reauth} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-5 h-5" />
                      <span>Completar permisos</span>
                    </button>
                  </div>
                </div>
              </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }} />
    </div>
  );
}

