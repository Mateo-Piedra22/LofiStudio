/**
 * TimerWidget v2
 * Pomodoro timer with work/break intervals
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Laptop } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

type TimerMode = 'work' | 'break' | 'longBreak';

interface TimerSettings {
    workDuration: number;      // minutes
    breakDuration: number;     // minutes
    longBreakDuration: number; // minutes
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
}

interface TimerWidgetProps {
    id: string;
    settings?: Partial<TimerSettings>;
}

const DEFAULT_SETTINGS: TimerSettings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
};

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

/**
 * Pomodoro timer widget
 */
export function TimerWidget({ id, settings: customSettings }: TimerWidgetProps) {
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Merge settings with defaults
    const settings = { ...DEFAULT_SETTINGS, ...customSettings };

    // Timer state
    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get duration for current mode
    const getDuration = useCallback((m: TimerMode) => {
        switch (m) {
            case 'work': return settings.workDuration * 60;
            case 'break': return settings.breakDuration * 60;
            case 'longBreak': return settings.longBreakDuration * 60;
        }
    }, [settings]);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    // Handle timer completion
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);

            // Play notification sound (if available)
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }

            // Transition to next mode
            if (mode === 'work') {
                const newSessions = completedSessions + 1;
                setCompletedSessions(newSessions);

                if (newSessions % settings.sessionsBeforeLongBreak === 0) {
                    setMode('longBreak');
                    setTimeLeft(settings.longBreakDuration * 60);
                    if (settings.autoStartBreaks) setIsRunning(true);
                } else {
                    setMode('break');
                    setTimeLeft(settings.breakDuration * 60);
                    if (settings.autoStartBreaks) setIsRunning(true);
                }
            } else {
                setMode('work');
                setTimeLeft(settings.workDuration * 60);
                if (settings.autoStartWork) setIsRunning(true);
            }
        }
    }, [timeLeft, isRunning, mode, completedSessions, settings]);

    // Controls
    const toggleTimer = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(getDuration(mode));
    }, [mode, getDuration]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(getDuration(newMode));
    }, [getDuration]);

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
            contentClassName="flex flex-col items-center justify-center gap-3 p-4"
        >
            {/* Mode tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                {(['work', 'break', 'longBreak'] as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
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
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-muted/30"
                    />
                    {/* Progress circle */}
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
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={resetTimer}
                    aria-label="Reset timer"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={toggleTimer}
                    aria-label={isRunning ? 'Pause' : 'Start'}
                >
                    <AnimatePresence mode="wait">
                        {isRunning ? (
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
            </div>

            {/* Session counter */}
            <div className="text-xs text-muted-foreground">
                Sessions: {completedSessions}
            </div>
        </WidgetWrapper>
    );
}

export default TimerWidget;
