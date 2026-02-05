/**
 * BreathingWidget v2
 * Guided breathing exercises for relaxation
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface BreathingPattern {
    id: string;
    name: string;
    description: string;
    inhale: number;
    hold: number;
    exhale: number;
    holdAfter?: number;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'idle';

const PATTERNS: BreathingPattern[] = [
    {
        id: 'box',
        name: 'Box Breathing',
        description: 'Equal timing for calm focus',
        inhale: 4,
        hold: 4,
        exhale: 4,
        holdAfter: 4,
    },
    {
        id: '478',
        name: '4-7-8',
        description: 'Deep relaxation technique',
        inhale: 4,
        hold: 7,
        exhale: 8,
    },
    {
        id: 'relaxing',
        name: 'Relaxing',
        description: 'Simple calming breath',
        inhale: 4,
        hold: 2,
        exhale: 6,
    },
    {
        id: 'energizing',
        name: 'Energizing',
        description: 'Quick energy boost',
        inhale: 3,
        hold: 0,
        exhale: 3,
    },
];

interface BreathingWidgetProps {
    id: string;
    settings?: {
        defaultPattern?: string;
    };
}

const PHASE_LABELS: Record<Phase, string> = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    holdAfter: 'Hold',
    idle: 'Ready',
};

/**
 * Breathing exercises widget
 */
export function BreathingWidget({ id, settings }: BreathingWidgetProps) {
    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(
        PATTERNS.find(p => p.id === settings?.defaultPattern) || PATTERNS[0]
    );
    const [isRunning, setIsRunning] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [timeLeft, setTimeLeft] = useState(0);
    const [cycles, setCycles] = useState(0);
    const [showPatterns, setShowPatterns] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Get phase duration
    const getPhaseDuration = useCallback((p: Phase): number => {
        switch (p) {
            case 'inhale': return selectedPattern.inhale;
            case 'hold': return selectedPattern.hold;
            case 'exhale': return selectedPattern.exhale;
            case 'holdAfter': return selectedPattern.holdAfter || 0;
            default: return 0;
        }
    }, [selectedPattern]);

    // Get next phase
    const getNextPhase = useCallback((current: Phase): Phase => {
        switch (current) {
            case 'inhale':
                return selectedPattern.hold > 0 ? 'hold' : 'exhale';
            case 'hold':
                return 'exhale';
            case 'exhale':
                if (selectedPattern.holdAfter && selectedPattern.holdAfter > 0) {
                    return 'holdAfter';
                }
                return 'inhale';
            case 'holdAfter':
                return 'inhale';
            default:
                return 'inhale';
        }
    }, [selectedPattern]);

    // Timer tick
    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    const nextPhase = getNextPhase(phase);
                    setPhase(nextPhase);

                    // Count cycle when returning to inhale
                    if (nextPhase === 'inhale' && phase !== 'idle') {
                        setCycles(c => c + 1);
                    }

                    return getPhaseDuration(nextPhase);
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, phase, getNextPhase, getPhaseDuration]);

    // Start/stop
    const toggle = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
            setPhase('idle');
            setTimeLeft(0);
        } else {
            setIsRunning(true);
            setPhase('inhale');
            setTimeLeft(selectedPattern.inhale);
        }
    }, [isRunning, selectedPattern]);

    // Reset
    const reset = useCallback(() => {
        setIsRunning(false);
        setPhase('idle');
        setTimeLeft(0);
        setCycles(0);
    }, []);

    // Select pattern
    const selectPattern = useCallback((pattern: BreathingPattern) => {
        reset();
        setSelectedPattern(pattern);
        setShowPatterns(false);
    }, [reset]);

    // Calculate scale for animation
    const getScale = (): number => {
        if (!isRunning || phase === 'idle') return 1;

        const duration = getPhaseDuration(phase);
        const progress = (duration - timeLeft) / duration;

        switch (phase) {
            case 'inhale':
                return 1 + progress * 0.3; // 1 -> 1.3
            case 'hold':
            case 'holdAfter':
                return phase === 'hold' ? 1.3 : 1;
            case 'exhale':
                return 1.3 - progress * 0.3; // 1.3 -> 1
            default:
                return 1;
        }
    };

    // Get phase color
    const getPhaseColor = (): string => {
        switch (phase) {
            case 'inhale': return 'text-blue-500';
            case 'exhale': return 'text-green-500';
            case 'hold':
            case 'holdAfter': return 'text-amber-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <WidgetWrapper
            id={id}
            title="Breathing"
            icon="Wind"
            showHeader={showHeaders}
            allowAlignment={true}
            contentClassName="p-3"
        >
            <div className="flex flex-col items-center gap-3">
                {/* Pattern selector */}
                {!isRunning && (
                    <div className="relative">
                        <button
                            onClick={() => setShowPatterns(!showPatterns)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {selectedPattern.name} ▾
                        </button>

                        <AnimatePresence>
                            {showPatterns && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden"
                                >
                                    {PATTERNS.map((pattern) => (
                                        <button
                                            key={pattern.id}
                                            onClick={() => selectPattern(pattern)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors',
                                                pattern.id === selectedPattern.id && 'bg-muted'
                                            )}
                                        >
                                            <p className="font-medium text-foreground">{pattern.name}</p>
                                            <p className="text-muted-foreground">{pattern.description}</p>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Breathing circle */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{ scale: getScale() }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className={cn(
                            'w-24 h-24 rounded-full border-4 flex items-center justify-center',
                            phase === 'idle' ? 'border-muted-foreground/30' : 'border-primary/50'
                        )}
                    >
                        <motion.div
                            animate={{ scale: getScale() }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className={cn(
                                'w-16 h-16 rounded-full flex items-center justify-center',
                                phase === 'idle' ? 'bg-muted' : 'bg-primary/20'
                            )}
                        >
                            <div className="text-center">
                                {isRunning ? (
                                    <>
                                        <p className={cn('text-2xl font-bold', getPhaseColor())}>
                                            {timeLeft}
                                        </p>
                                    </>
                                ) : (
                                    <Wind className="w-6 h-6 text-muted-foreground" />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Phase label */}
                <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('text-sm font-medium', getPhaseColor())}
                >
                    {PHASE_LABELS[phase]}
                </motion.p>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={reset}
                        disabled={!isRunning && cycles === 0}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="default"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={toggle}
                    >
                        {isRunning ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </Button>
                </div>

                {/* Cycle counter */}
                {cycles > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {cycles} cycle{cycles > 1 ? 's' : ''} completed
                    </p>
                )}
            </div>
        </WidgetWrapper>
    );
}

export default BreathingWidget;
