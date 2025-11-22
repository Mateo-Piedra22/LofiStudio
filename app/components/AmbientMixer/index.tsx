'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import ambientSounds from '@/lib/config/ambient-sounds.json';

const SOUNDS = ((ambientSounds as any).sounds as Array<{id:string;label:string;icon:string;url?:string;provider?:string;query?:string;category?:string}>).map(s => ({
    id: s.id,
    label: s.label,
    iconName: s.icon,
    url: s.url,
    provider: (s as any).provider,
    query: (s as any).query,
    category: (s as any).category || 'General',
}));
const GROUPS: Record<string, typeof SOUNDS> = SOUNDS.reduce((acc: any, sound: any) => {
    const k = sound.category || 'General';
    if (!acc[k]) acc[k] = [];
    acc[k].push(sound);
    return acc;
}, {} as Record<string, typeof SOUNDS>);

export default function AmbientMixer() {
    const [isOpen, setIsOpen] = useState(false);
    const [volumes, setVolumes] = useState<Record<string, number>>({});
    const [isMuted, setIsMuted] = useState(false);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
    const volumesRef = useRef<Record<string, number>>({});
    const unlockedRef = useRef(false);
    const FALLBACK_AUDIO: Record<string, string> = {};

    useEffect(() => {
        const initAll = async () => {
            for (const sound of SOUNDS) {
                if (audioRefs.current[sound.id]) continue;
                let src = sound.url || '';
                if (!src && sound.provider === 'freesound' && sound.query) {
                    try {
                        const u = `/api/freesound/search?${new URLSearchParams({ q: sound.query, min: '60' }).toString()}`;
                        const r = await fetch(u);
                        const d = await r.json();
                        if (d?.ok && d?.src) src = d.src as string;
                    } catch {}
                }
                
                if (!src) continue;
                const audio = new Audio();
                audio.preload = 'auto';
                audio.loop = true;
                (audio as any).playsInline = true;
                try {
                    const isExternal = /^https?:\/\//i.test(src);
                    audio.src = isExternal ? `/api/audio/fetch?url=${encodeURIComponent(src)}` : src;
                } catch { audio.src = src; }
                audio.volume = 0;
                audio.load();
                audio.addEventListener('canplay', () => {
                    const vol = volumesRef.current[sound.id] || 0;
                    if (vol > 0) {
                        audio.volume = vol / 100;
                        audio.play().catch(() => {});
                    }
                });
                audioRefs.current[sound.id] = audio;
            }
        };
        initAll();

        const unlock = () => {
            if (unlockedRef.current) return;
            unlockedRef.current = true;
            Object.values(audioRefs.current).forEach(a => {
                try {
                    a.muted = true;
                    a.play().then(() => { a.pause(); a.muted = false; });
                } catch {}
            });
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });

        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                try { audio.pause(); } catch {}
                audio.src = '';
            });
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, []);

    const handleVolumeChange = (id: string, value: number[]) => {
        const newVolume = value[0];
        setVolumes(prev => ({ ...prev, [id]: newVolume }));
        volumesRef.current[id] = newVolume;

        const audio = audioRefs.current[id];
        if (audio) {
            if (audio.readyState < 2) {
                try { audio.load(); } catch {}
            }
            if (newVolume > 0 && audio.paused) {
                audio.play().catch(() => {});
            } else if (newVolume === 0 && !audio.paused) {
                audio.pause();
            }
            audio.volume = newVolume / 100;
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        Object.values(audioRefs.current).forEach(audio => {
            audio.muted = next;
        });
    };

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <Card className="w-72 p-4 glass animate-in slide-in-from-right-10 fade-in duration-300 mb-2 border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                            <AnimatedIcon name="Volume2" className="w-4 h-4" /> Ambient Sounds
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-accent/10"
                            onClick={() => setIsOpen(false)}
                        >
                            <AnimatedIcon name="X" className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(GROUPS).map(([category, list]) => (
                            <div key={category} className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</p>
                                {list.map((sound: any) => (
                                    <div key={sound.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="flex items-center gap-2">
                                                <AnimatedIcon name={sound.iconName} className="w-4 h-4" />
                                                {sound.label}
                                            </span>
                                            <span className="text-xs">{volumes[sound.id] || 0}%</span>
                                        </div>
                                        <Slider
                                            value={[volumes[sound.id] || 0]}
                                            max={100}
                                            step={1}
                                            onValueChange={(val: number[]) => handleVolumeChange(sound.id, val)}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:bg-accent/20'
                    }`}
                title="Ambient Sounds Mixer"
            >
                <AnimatedIcon name="Volume2" className={`w-6 h-6 ${Object.values(volumes).some(v => v > 0) && !isOpen ? 'animate-pulse text-green-500' : ''}`} />
            </Button>
        </div>
    );
}
