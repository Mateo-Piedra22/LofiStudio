'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react'
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
    <div className={`fixed top-0 z-50 w-full ${isEditing ? 'opacity-0 pointer-events-none' : ''}`} style={{ pointerEvents: 'none' }}>
      <div className="group relative w-full h-16 pt-2 pointer-events-none">
        {/* Hover trigger area with visual hint */}
        <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-[60] flex justify-center pointer-events-auto cursor-pointer" />
        <div className="absolute top-0 inset-x-0 h-2 z-[59] flex justify-center pointer-events-none">
          <div className="w-24 h-1 bg-foreground/20 rounded-b-full shadow-sm backdrop-blur-sm transition-opacity duration-300 opacity-50 group-hover:opacity-0" />
        </div>

        {/* Navbar Content */}
        <div className="px-4 md:px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-auto">
          <div className="h-14 md:h-16 flex items-center">
            <div className="flex items-center gap-2 glass-panel rounded-full border px-2 py-1 shadow-lg" style={{ ['--glass-opacity' as any]: String(minGlass) }}>
              <Link href="/" className="flex items-center gap-2">
                <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-8 md:h-9 w-auto rounded-md shadow-md" />
                <span className="text-foreground text-base md:text-lg font-bold tracking-wide">LofiStudio</span>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                className="h-10 rounded-full text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => setOpen(true)}
              >
                <Menu className="w-6 h-6" />
                <span className="ml-2">Menu</span>
              </Button>
            </div>
          </div>
        </div>
        <StudioSidebar isOpen={open} onClose={() => setOpen(false)} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }} />
    </div>
  );
}

