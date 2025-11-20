'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CloudRain, CloudLightning, Wind as WindIcon, Trees, Flame, Coffee, Moon, Volume2, VolumeX, X } from 'lucide-react';
import ambientSounds from '@/lib/config/ambient-sounds.json';

const ICONS: Record<string, any> = {
    CloudRain,
    CloudLightning,
    Wind: WindIcon,
    Trees,
    Flame,
    Coffee,
    Moon,
};
const SOUNDS = ((ambientSounds as any).sounds as Array<{id:string;label:string;icon:string;url:string}>).map(s => ({
    id: s.id,
    label: s.label,
    icon: ICONS[s.icon] || Volume2,
    url: s.url,
}));

export default function AmbientMixer() {
    const [isOpen, setIsOpen] = useState(false);
    const [volumes, setVolumes] = useState<Record<string, number>>({});
    const [isMuted, setIsMuted] = useState(false);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        // Initialize audio elements
        SOUNDS.forEach(sound => {
            if (!audioRefs.current[sound.id]) {
                const audio = new Audio(sound.url);
                audio.loop = true;
                audioRefs.current[sound.id] = audio;
            }
        });

        return () => {
            // Cleanup
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    const handleVolumeChange = (id: string, value: number[]) => {
        const newVolume = value[0];
        setVolumes(prev => ({ ...prev, [id]: newVolume }));

        const audio = audioRefs.current[id];
        if (audio) {
            if (newVolume > 0 && audio.paused) {
                audio.play().catch(e => console.error("Audio play failed", e));
            } else if (newVolume === 0 && !audio.paused) {
                audio.pause();
            }
            audio.volume = newVolume / 100;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        Object.entries(audioRefs.current).forEach(([id, audio]) => {
            const vol = volumes[id] || 0;
            if (vol > 0) {
                if (!isMuted) { // Muting
                    audio.pause();
                } else { // Unmuting
                    audio.play().catch(e => console.error("Audio play failed", e));
                }
            }
        });
    };

    return (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <Card className="w-72 p-4 glass animate-in slide-in-from-right-10 fade-in duration-300 mb-2 border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-foreground font-semibold flex items-center gap-2">
                            <Volume2 className="w-4 h-4" /> Ambient Sounds
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-accent/10"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {SOUNDS.map(sound => (
                            <div key={sound.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <sound.icon className="w-4 h-4" />
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
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:bg-accent/20'
                    }`}
                title="Ambient Sounds Mixer"
            >
                <Volume2 className={`w-6 h-6 ${Object.values(volumes).some(v => v > 0) && !isOpen ? 'animate-pulse text-green-500' : ''}`} />
            </Button>
        </div>
    );
}
