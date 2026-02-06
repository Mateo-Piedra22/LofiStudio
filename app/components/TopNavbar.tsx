'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Volume2 } from 'lucide-react'
import { useTheme, useGlassOpacity, useSettingsStore } from '@/lib/stores/settings.store';
import { useAudioStore } from '@/lib/stores/audio.store';
import UserAuth from '@/app/components/UserAuth';
import { StudioSidebar } from './StudioV2/ui/StudioSidebar';

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
    <div className={`fixed inset-y-0 left-0 z-[50] ${isEditing ? 'opacity-0 pointer-events-none' : ''}`} style={{ pointerEvents: 'none' }}>

      {/* Left Vertical Trigger Rail */}
      <div className="group relative h-full flex flex-col justify-center pointer-events-none pl-0">

        {/* Vertical Trigger Zone (Always interactive) */}
        <div className="absolute inset-y-0 left-0 w-[8px] bg-transparent z-[60] pointer-events-auto cursor-e-resize" />

        {/* Visual Hint: Thin vertical pill on the left edge */}
        <div className="absolute inset-y-0 left-0 w-1 md:w-1.5 z-[59] flex items-center pointer-events-none">
          <div className="h-24 w-full bg-foreground/30 rounded-r-full shadow-sm backdrop-blur-md transition-opacity duration-300 opacity-60 group-hover:opacity-0" />
        </div>

        {/* Content: Slides out from left on hover */}
        <div className="absolute left-1 top-4 bottom-4 w-auto flex flex-col justify-center pointer-events-none">
          <div
            className="glass-panel rounded-2xl border border-white/10 p-2 shadow-2xl flex flex-col items-center gap-6 opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-500 ease-out backdrop-blur-xl bg-black/40"
            style={{ ['--glass-opacity' as any]: String(minGlass) }}
          >
            {/* Logo (Home) */}
            <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-105" title="Home">
              <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-10 w-10 rounded-lg shadow-md object-cover" />
            </Link>

            {/* Divider */}
            <div className="w-8 h-[1px] bg-white/10" />

            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl text-foreground hover:bg-white/10 hover:scale-110 transition-all bg-white/5"
              onClick={() => setOpen(true)}
              title="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </Button>

            {/* Decorative Vertical Text */}
            <div className="writing-vertical-lr text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 select-none py-6 rotate-180" style={{ writingMode: 'vertical-rl' }}>
              LOFI STUDIO
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto">
        <StudioSidebar isOpen={open} onClose={() => setOpen(false)} />
      </div>

      {/* Right Vertical Trigger Rail (Ambient Mixer) */}
      <div className={`fixed inset-y-0 right-0 z-[50] ${isEditing ? 'opacity-0 pointer-events-none' : ''}`} style={{ pointerEvents: 'none' }}>
        <div className="group relative h-full flex flex-col justify-center pointer-events-none pr-0">

          {/* Vertical Trigger Zone (Right) */}
          <div className="absolute inset-y-0 right-0 w-[8px] bg-transparent z-[60] pointer-events-auto cursor-w-resize" />

          {/* Visual Hint */}
          <div className="absolute inset-y-0 right-0 w-1 md:w-1.5 z-[59] flex items-center pointer-events-none">
            <div className="h-24 w-full bg-foreground/30 rounded-l-full shadow-sm backdrop-blur-md transition-opacity duration-300 opacity-60 group-hover:opacity-0" />
          </div>

          {/* Content Slide-out */}
          <div className="absolute right-1 top-4 bottom-4 w-auto flex flex-col justify-center pointer-events-none">
            <div
              className="glass-panel rounded-2xl border border-white/10 p-2 shadow-2xl flex flex-col items-center gap-6 opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-500 ease-out backdrop-blur-xl bg-black/40"
              style={{ ['--glass-opacity' as any]: String(minGlass) }}
            >
              {/* Mixer Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-foreground hover:bg-white/10 hover:scale-110 transition-all bg-white/5"
                onClick={openAmbientMixer}
                title="Open Ambient Sounds"
              >
                <Volume2 className="w-6 h-6" />
              </Button>

              {/* Decorative Vertical Text */}
              <div className="writing-vertical-lr text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 select-none py-6" style={{ writingMode: 'vertical-rl' }}>
                AMBIENT SOUNDS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to catch clicks if needed */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }} />
    </div>
  );
}

