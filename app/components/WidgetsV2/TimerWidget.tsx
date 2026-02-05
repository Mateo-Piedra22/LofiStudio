/**
 * TimerWidget v2
 * Pomodoro timer connected to global TimerStore
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Laptop, SkipForward } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useTimerStore, useTimerMode, useTimerActive, useTimerProgress, useSessionsCompleted } from '@/lib/stores/timer.store';
import { formatTime } from '@/lib/utils';
import type { TimerMode } from '@/lib/stores/timer.store';

const MODE_LABELS: Record<TimerMode, string> = {
    work: 'Focus',
    break: 'Break',
    longBreak: 'Long Break',
};

const MODE_ICONS: Record<TimerMode, typeof Laptop> = {
    work: Laptop,
    break: Coffee,
    longBreak: Coffee,
};

export function TimerWidget({ id }: { id: string }) {
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Store hooks
    const mode = useTimerMode();
    const isActive = useTimerActive(); // Returns true if running and not paused
    const progress = useTimerProgress();
    const sessions = useSessionsCompleted();
    const secondsRemaining = useTimerStore(s => s.secondsRemaining);
    const isPaused = useTimerStore(s => s.isPaused);

    // Actions
    const start = useTimerStore(s => s.start);
    const pause = useTimerStore(s => s.pause);
    const resume = useTimerStore(s => s.resume);
    const reset = useTimerStore(s => s.reset);
    const skip = useTimerStore(s => s.skip);
    const switchToWork = useTimerStore(s => s.switchToWork);
    const switchToBreak = useTimerStore(s => s.switchToBreak);
    const tick = useTimerStore(s => s.tick);

    // Global ticker effect - Only one component should probably drive the tick, 
    // but typically the store might rely on a global interval or specific active component.
    // Since we deleted the "Zombie" component which likely held the interval, we must ensure
    // SOMETHING is ticking.
    // 
    // Ideally, the global layout (StudioClient) or a dedicated Provider handles the tick,
    // but placing it here works if we assume the widget is always present. 
    // However, if the widget is removed, the timer stops.
    // For V2 Migration, we'll place the ticker here. 
    // *Better Architecture*: Move ticker to a Global Context, but for now, 
    // this aligns with "Migrate Widget Logic".

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, tick]);

    // Handle toggle
    const toggleTimer = () => {
        if (isActive) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            start();
        }
    };

    // Mode switching
    const handleModeSwitch = (m: TimerMode) => {
        if (m === 'work') switchToWork();
        else switchToBreak(); // Simplification: Manual switch usually acts as skip/force
    };

    // Display mode logic (treat longBreak as break for simple UI if needed, but we have 3 tabs)
    // We'll keep the 3 tabs UI from the previous widget but make them functional.

    // Get mode colors
    const getModeColor = (m: TimerMode) => {
        switch (m) {
            case 'work': return 'text-red-500';
            case 'break': return 'text-green-500';
            case 'longBreak': return 'text-blue-500';
        }
    };

    const ModeIcon = MODE_ICONS[mode];

    return (
        <WidgetWrapper
            id={id}
            title="Pomodoro"
            icon="Timer"
            showHeader={showHeaders}
            allowAlignment={true}
            contentClassName="gap-3 p-4"
        >
            {/* Mode tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                {(['work', 'break', 'longBreak'] as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => {
                            if (m === 'work') switchToWork();
                            // For manual break selection, we might need a specific action or just force it.
                            // The store has `switchToBreak` which calculates short/long automatically.
                            // To force specific break type, we might need `setMode`.
                            else useTimerStore.getState().setMode(m);
                        }}
                        className={`px-2 py-1 text-xs rounded-md transition-all ${mode === m
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* Timer display */}
            <div className="relative">
                {/* Progress circle */}
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-muted/30"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className={getModeColor(mode)}
                        strokeDasharray={283}
                        strokeDashoffset={283 - (283 * progress) / 100}
                        initial={false}
                        animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ModeIcon className={`w-4 h-4 mb-1 ${getModeColor(mode)}`} />
                    <span className="text-2xl font-bold font-mono text-foreground">
                        {formatTime(secondsRemaining)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={reset}
                    title="Reset"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={toggleTimer}
                    title={isActive ? 'Pause' : 'Start'}
                >
                    <AnimatePresence mode="wait">
                        {isActive ? (
                            <motion.div
                                key="pause"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Pause className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="play"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Play className="w-5 h-5 ml-0.5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={skip}
                    title="Skip"
                >
                    <SkipForward className="w-4 h-4" />
                </Button>
            </div>

            {/* Session counter */}
            <div className="text-xs text-muted-foreground">
                Sessions: {sessions}
            </div>
        </WidgetWrapper>
    );
}

export default TimerWidget;
