'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Maximize2, Minimize2, Eye, EyeOff, Settings as SettingsIcon, Home, User, Waves, Image as ImageIcon, Palette, Layout, BarChart3, Keyboard, X, Sparkles, Info, Scale, FileText, Cookie, Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsStore, useTheme, useGlassOpacity } from '@/lib/stores/settings.store';
import { useAudioStore } from '@/lib/stores/audio.store';
import UserAuth from '@/app/components/UserAuth';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [glass] = useGlassOpacity();
  const [isEditing, setIsEditing] = useState(false);
  const showHeaders = useSettingsStore(s => s.settings.appearance.showHeaders);
  const setShowHeaders = useSettingsStore(s => s.setShowHeaders);
  const setMixerOpen = useAudioStore(s => s.setMixerOpen);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch { }
    } else {
      try { document.documentElement.requestFullscreen(); } catch { }
    }
  };

  const toggleZen = () => {
    try { window.dispatchEvent(new Event('toggle-zen-mode')); } catch { }
    setOpen(false);
  };

  const openSettings = () => {
    try { window.dispatchEvent(new Event('open-settings')); } catch { }
    setOpen(false);
  };

  const openAmbientMixer = () => {
    setMixerOpen(true);
    setOpen(false);
  };

  const openBackgroundSelector = () => {
    try { window.dispatchEvent(new Event('open-background-selector')); } catch { }
    setOpen(false);
  };

  const minGlass = Math.max(0.25, Math.min(1, glass));

  useEffect(() => {
    const onEditState = (e: any) => {
      try { setIsEditing(!!(e?.detail ?? false)); } catch { }
    };
    window.addEventListener('editing-layout-change', onEditState as any);
    return () => window.removeEventListener('editing-layout-change', onEditState as any);
  }, []);

  const toggleEditLayout = () => {
    try { window.dispatchEvent(new Event('toggle-edit-layout')); } catch { }
    setOpen(false);
  };

  const openWidgetManager = () => {
    try { window.dispatchEvent(new Event('open-widget-manager')); } catch { }
    setOpen(false);
  };

  const toggleHeaders = () => {
    try { window.dispatchEvent(new Event('toggle-hide-headers')); } catch { }
    setShowHeaders(!showHeaders);
  };

  const reauth = () => {
    try { window.dispatchEvent(new Event('open-reauth')); } catch { }
    setOpen(false);
  };

  return (
    <div className={`fixed top-0 z-50 w-full ${isEditing ? 'opacity-0 pointer-events-none' : ''}`} style={{ pointerEvents: 'none' }}>
      <div className="group relative w-full h-16 pt-2 pointer-events-auto">
        {/* Hover trigger area with visual hint */}
        <div className="absolute top-0 inset-x-0 h-2 bg-transparent z-[60] flex justify-center">
          <div className="w-24 h-1 bg-foreground/20 rounded-b-full shadow-sm backdrop-blur-sm transition-opacity duration-300 opacity-50 group-hover:opacity-0" />
        </div>

        {/* Navbar Content */}
        <div className="px-4 md:px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <div className="h-14 md:h-16 flex items-center">
            <div className="flex items-center gap-2 glass-panel rounded-full border px-2 py-1 shadow-lg" style={{ ['--glass-opacity' as any]: String(minGlass) }}>
              <Link href="/" className="flex items-center gap-2">
                <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-8 md:h-9 w-auto rounded-md shadow-md" />
                <span className="text-foreground text-base md:text-lg font-bold tracking-wide">LofiStudio</span>
              </Link>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="lg" className="h-10 rounded-full text-foreground hover:bg-black/5 dark:hover:bg-white/10">
                    <Menu className="w-6 h-6" />
                    <span className="ml-2">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-black/90 backdrop-blur-md border-l border-white/10 text-white w-[520px] lg:w-[600px] xl:w-[640px] max-w-[92vw] overflow-y-auto overflow-x-hidden custom-scrollbar">
                  <VisuallyHidden.Root>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Navigation and tools</SheetDescription>
                  </VisuallyHidden.Root>

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
                          <Waves className="w-5 h-5" />
                          <span className="ml-2">Open Mixer</span>
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="text-sm uppercase tracking-wider text-white/60">Visuals</div>
                      <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={openBackgroundSelector} className="rounded-full">
                          <ImageIcon className="w-5 h-5" />
                          <span className="ml-2">Background</span>
                        </Button>
                        <Button variant="outline" className="rounded-full border-white/20 text-white/90">
                          <Palette className="w-5 h-5" />
                          <span className="ml-2">Theme</span>
                        </Button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant={theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('light')}
                          className="flex-1 rounded-lg border-white/20 text-white/90"
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Light
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                          className="flex-1 rounded-lg border-white/20 text-white/90"
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Dark
                        </Button>
                        <Button
                          variant={theme === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('auto')}
                          className="flex-1 rounded-lg border-white/20 text-white/90"
                        >
                          <Monitor className="w-4 h-4 mr-2" />
                          Auto
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="text-sm uppercase tracking-wider text-white/60">Tools</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" onClick={toggleFullscreen} className="rounded-full text-white/90 justify-start">
                          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                          <span className="ml-2">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                        </Button>
                        <Button variant="ghost" onClick={toggleZen} className="rounded-full text-white/90 justify-start">
                          <EyeOff className="w-5 h-5" />
                          <span className="ml-2">Focus Mode</span>
                        </Button>
                        <Button variant="ghost" onClick={toggleEditLayout} className="rounded-full text-white/90 justify-start">
                          <Layout className="w-5 h-5" />
                          <span className="ml-2">Edit Layout</span>
                        </Button>
                        <Button variant="ghost" onClick={openWidgetManager} className="rounded-full text-white/90 justify-start">
                          <Layout className="w-5 h-5" />
                          <span className="ml-2">Add Widgets</span>
                        </Button>
                        <Button variant="ghost" onClick={toggleHeaders} className="rounded-full text-white/90 justify-start">
                          {showHeaders ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          <span className="ml-2">{showHeaders ? 'Hide Headers' : 'Show Headers'}</span>
                        </Button>
                        <Button variant="ghost" onClick={() => { try { window.dispatchEvent(new Event('open-stats')); } catch { } setOpen(false); }} className="rounded-full text-white/90 justify-start">
                          <BarChart3 className="w-5 h-5" />
                          <span className="ml-2">Stats</span>
                        </Button>
                        <Button variant="ghost" onClick={() => { try { window.dispatchEvent(new Event('open-logs')); } catch { } setOpen(false); }} className="rounded-full text-white/90 justify-start">
                          <Keyboard className="w-5 h-5" />
                          <span className="ml-2">Activity Log</span>
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="text-sm uppercase tracking-wider text-white/60">Links</div>
                      <div className="grid grid-cols-4 gap-3">
                        <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <Home className="w-5 h-5" />
                          <span>Home</span>
                        </Link>
                        <button onClick={openSettings} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <SettingsIcon className="w-5 h-5" />
                          <span>Settings</span>
                        </button>
                        <Link href="/changelog" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <Sparkles className="w-5 h-5" />
                          <span>Changelog</span>
                        </Link>
                        <button onClick={reauth} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <X className="w-5 h-5" />
                          <span>Permissions</span>
                        </button>
                        <Link href="/about" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <Info className="w-5 h-5" />
                          <span>About</span>
                        </Link>
                        <Link href="/legal" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <Scale className="w-5 h-5" />
                          <span>Legal</span>
                        </Link>
                        <Link href="/terms" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <FileText className="w-5 h-5" />
                          <span>Terms</span>
                        </Link>
                        <Link href="/cookies" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <Cookie className="w-5 h-5" />
                          <span>Cookies</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }} />
    </div>
  );
}

