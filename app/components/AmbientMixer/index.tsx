'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import {
  CloudRain,
  CloudLightning,
  Wind,
  Snowflake,
  Waves,
  Droplets,
  Trees,
  Moon,
  Bird,
  Flame,
  Coffee,
  Book,
  Building2,
  Train,
  Ship,
  Volume2,
  X,
  Pause,
  Play,
} from 'lucide-react'
import type React from 'react'
import ambientList from '@/lib/config/ambient-sounds.json';
import { Howl } from 'howler';

type AmbientItem = { id: string; name: string; icon: string; initialVolume: number; src: string; category: string };
const SOUNDS: AmbientItem[] = ambientList as unknown as AmbientItem[];
const GROUPS: Record<string, AmbientItem[]> = SOUNDS.reduce((acc, s) => {
    const k = s.category || 'General';
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
}, {} as Record<string, AmbientItem[]>);

export default function AmbientMixer() {
    const [isOpen, setIsOpen] = useState(false);
    const [volumes, setVolumes] = useState<Record<string, number>>(() => {
        const m: Record<string, number> = {};
        SOUNDS.forEach(s => { m[s.id] = s.initialVolume || 0 });
        return m;
    });
    const [playing, setPlaying] = useState<Record<string, boolean>>(() => {
        const m: Record<string, boolean> = {};
        SOUNDS.forEach(s => { m[s.id] = false });
        return m;
    });
    const howlRefs = useRef<Record<string, Howl>>({});

    useEffect(() => {
        SOUNDS.forEach(s => {
            if (howlRefs.current[s.id]) return;
            const h = new Howl({ src: [s.src], loop: true, preload: true, volume: 0 });
            howlRefs.current[s.id] = h;
        });
        return () => {
            Object.values(howlRefs.current).forEach(h => { try { h.stop(); h.unload(); } catch {} });
        };
    }, []);

    const handleVolumeChange = (id: string, value: number[]) => {
        const v = value[0];
        setVolumes(prev => ({ ...prev, [id]: v }));
        const h = howlRefs.current[id];
        if (h) h.volume(v / 100);
    };

    const togglePlay = (id: string) => {
        const h = howlRefs.current[id];
        if (!h) return;
        setPlaying(prev => {
            const next = !prev[id];
            if (next) {
                if (!h.playing()) h.play();
                h.volume((volumes[id] || 0) / 100);
            } else {
                try { h.pause(); } catch {}
            }
            return { ...prev, [id]: next };
        });
    };

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <Card className="w-72 p-4 glass animate-in slide-in-from-right-10 fade-in duration-300 mb-2 border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                            <AnimatedIcon animationSrc="/lottie/Volume2.json" fallbackIcon={Volume2} className="w-4 h-4" /> Ambient Sounds
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:h-6 md:w-6 h-11 w-11 hover:bg-accent/10"
                            onClick={() => setIsOpen(false)}
                        >
                            <AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(GROUPS).map(([category, list]) => (
                            <div key={category} className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</p>
                                {list.map(sound => (
                                    <div key={sound.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="flex items-center gap-2">
                                                {(() => {
                                                  const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
                                                    CloudRain,
                                                    CloudLightning,
                                                    Wind,
                                                    Snowflake,
                                                    Waves,
                                                    Droplets,
                                                    Trees,
                                                    Moon,
                                                    Bird,
                                                    Flame,
                                                    Coffee,
                                                    Book,
                                                    Building: Building2,
                                                    Train,
                                                    Ship,
                                                  }
                                                  const Fallback = ICON_MAP[sound.icon] || Volume2
                                                  return <AnimatedIcon animationSrc={`/lottie/${sound.icon}.json`} fallbackIcon={Fallback} className="w-4 h-4" />
                                                })()}
                                                {sound.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs">{volumes[sound.id] || 0}%</span>
                                                <Button variant="ghost" size="icon" className="md:h-6 md:w-6 h-11 w-11" onClick={() => togglePlay(sound.id)}>
                                                    {playing[sound.id] ? (
                                                      <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-4 h-4" />
                                                    ) : (
                                                      <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
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
                className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:bg-accent/20'}`}
            >
                <AnimatedIcon animationSrc="/lottie/Volume2.json" fallbackIcon={Volume2} className={`w-6 h-6 ${Object.values(playing).some(v => v) && !isOpen ? 'animate-pulse text-green-500' : ''}`} />
            </Button>
        </div>
    );
}
