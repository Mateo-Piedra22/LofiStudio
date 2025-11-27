'use client';

import { useState, useEffect } from 'react';
 
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Wind } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

const BREATHING_PATTERNS = {
    relax: { inhale: 4, hold: 7, exhale: 8, label: '4-7-8 Relax' },
    focus: { inhale: 4, hold: 4, exhale: 4, label: 'Box Breathing' },
    balance: { inhale: 5, hold: 0, exhale: 5, label: 'Coherent' },
};

export default function BreathingWidget() {
    const [pattern, setPattern] = useLocalStorage<keyof typeof BREATHING_PATTERNS>('breathingPattern', 'relax');
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

    useEffect(() => {
        if (!isActive) {
            setPhase('inhale');
            setSeconds(0);
            return;
        }

        const currentPattern = BREATHING_PATTERNS[pattern];
        const interval = setInterval(() => {
            setSeconds((s) => {
                const next = s + 1;
                if (phase === 'inhale' && next >= currentPattern.inhale) {
                    setPhase(currentPattern.hold > 0 ? 'hold' : 'exhale');
                    return 0;
                }
                if (phase === 'hold' && next >= currentPattern.hold) {
                    setPhase('exhale');
                    return 0;
                }
                if (phase === 'exhale' && next >= currentPattern.exhale) {
                    setPhase('inhale');
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, phase, pattern]);

    const getScale = () => {
        if (!isActive) return 1;
        const currentPattern = BREATHING_PATTERNS[pattern];
        const progress = seconds / (currentPattern[phase] || 1);

        if (phase === 'inhale') return 1 + progress * 0.5; // 1 -> 1.5
        if (phase === 'hold') return 1.5;
        if (phase === 'exhale') return 1.5 - progress * 0.5; // 1.5 -> 1
        return 1;
    };

    const getInstruction = () => {
        if (!isActive) return 'Click to Start';
        if (phase === 'inhale') return 'Inhale...';
        if (phase === 'hold') return 'Hold...';
        if (phase === 'exhale') return 'Exhale...';
    };

    return (
        <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass-widget border text-card-foreground shadow-sm overflow-hidden p-4 relative group/widget">
            {showWidgetHeaders ? (
                <div data-slot="header" className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2 text-foreground/90">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <AnimatedIcon animationSrc="/lottie/Wind.json" fallbackIcon={Wind} className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Breathing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={pattern}
                            onChange={(e) => {
                                setPattern(e.target.value as any);
                                setIsActive(false);
                            }}
                            className="bg-accent/20 border border-border text-foreground text-xs rounded px-2 py-1 focus:ring-0 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Breathing pattern"
                        >
                            {Object.entries(BREATHING_PATTERNS).map(([key, val]) => (
                                <option key={key} value={key} className="bg-background text-foreground">
                                    {val.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : null}
            <div data-slot="content" className={`flex-1 min-h-0 w-full flex items-center justify-center relative p-4`}>
                <div
                    onClick={() => setIsActive(!isActive)}
                    className="cursor-pointer relative flex items-center justify-center w-32 h-32"
                >
                    <div
                        className="absolute inset-0 rounded-full bg-primary/20 blur-xl transition-all duration-1000 ease-in-out"
                        style={{ transform: `scale(${getScale()})` }}
                    />
                    <div
                        className="absolute inset-0 rounded-full border-2 border-primary/50 transition-all duration-1000 ease-in-out"
                        style={{ transform: `scale(${getScale()})` }}
                    />
                    <div className="z-10 text-center">
                        <p className="text-foreground font-medium text-lg transition-all duration-300">
                            {getInstruction()}
                        </p>
                        {isActive && (
                            <p className="text-muted-foreground text-xs mt-1">
                                {seconds + 1}s
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
