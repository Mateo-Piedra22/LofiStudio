/**
 * HabitTrackerWidget v2
 * Daily habit tracking with streak counter
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Flame, Check, X } from 'lucide-react';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface HabitCompletion {
    date: string; // ISO date string
    completed: boolean;
}

interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    completions: HabitCompletion[];
    createdAt: string;
}

interface HabitTrackerWidgetProps {
    id: string;
    settings?: {
        maxHabits?: number;
        daysToShow?: number;
    };
}

const STORAGE_KEY = 'lofi-habits-v2';

const HABIT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '💪', '🎯', '💤', '🥗'];

/**
 * Habit tracker widget
 */
export function HabitTrackerWidget({ id, settings }: HabitTrackerWidgetProps) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const maxHabits = settings?.maxHabits ?? 5;
    const daysToShow = settings?.daysToShow ?? 7;

    const today = useMemo(() => startOfDay(new Date()).toISOString(), []);

    // Get recent days
    const recentDays = useMemo(() => {
        return Array.from({ length: daysToShow }, (_, i) =>
            startOfDay(subDays(new Date(), daysToShow - 1 - i)).toISOString()
        );
    }, [daysToShow]);

    // Load habits
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setHabits(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load habits:', e);
        }
    }, []);

    // Save habits
    const saveHabits = useCallback((newHabits: Habit[]) => {
        setHabits(newHabits);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));
        }
    }, []);

    // Add habit
    const addHabit = useCallback(() => {
        if (!newHabitName.trim()) return;
        if (habits.length >= maxHabits) return;

        const habit: Habit = {
            id: Date.now().toString(),
            name: newHabitName.trim(),
            icon: selectedIcon,
            color: selectedColor,
            completions: [],
            createdAt: new Date().toISOString(),
        };

        saveHabits([...habits, habit]);
        setNewHabitName('');
        setIsAdding(false);
    }, [newHabitName, habits, maxHabits, selectedIcon, selectedColor, saveHabits]);

    // Remove habit
    const removeHabit = useCallback((habitId: string) => {
        saveHabits(habits.filter(h => h.id !== habitId));
    }, [habits, saveHabits]);

    // Toggle completion for a day
    const toggleCompletion = useCallback((habitId: string, date: string) => {
        saveHabits(habits.map(habit => {
            if (habit.id !== habitId) return habit;

            const existingIndex = habit.completions.findIndex(c =>
                isSameDay(parseISO(c.date), parseISO(date))
            );

            if (existingIndex >= 0) {
                // Toggle existing
                const updated = [...habit.completions];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    completed: !updated[existingIndex].completed
                };
                return { ...habit, completions: updated };
            } else {
                // Add new completion
                return {
                    ...habit,
                    completions: [...habit.completions, { date, completed: true }],
                };
            }
        }));
    }, [habits, saveHabits]);

    // Get streak for a habit
    const getStreak = useCallback((habit: Habit): number => {
        let streak = 0;
        const sortedDates = [...recentDays].reverse();

        for (const date of sortedDates) {
            const completion = habit.completions.find(c =>
                isSameDay(parseISO(c.date), parseISO(date))
            );
            if (completion?.completed) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }, [recentDays]);

    // Check if day is completed
    const isCompleted = useCallback((habit: Habit, date: string): boolean => {
        const completion = habit.completions.find(c =>
            isSameDay(parseISO(c.date), parseISO(date))
        );
        return completion?.completed ?? false;
    }, []);

    // Actions
    const actions: WidgetAction[] = habits.length < maxHabits && !isAdding ? [
        {
            id: 'add',
            icon: 'Plus',
            label: 'Add habit',
            onClick: () => setIsAdding(true),
        },
    ] : [];

    return (
        <WidgetWrapper
            id={id}
            title="Habits"
            icon="Target"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-2 overflow-hidden">
                {/* Add habit form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pb-2 border-b border-border/50"
                        >
                            <Input
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="Habit name"
                                className="h-7 text-xs"
                                autoFocus
                            />
                            {/* Icon selector */}
                            <div className="flex gap-1">
                                {HABIT_ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => setSelectedIcon(icon)}
                                        className={cn(
                                            'w-6 h-6 rounded flex items-center justify-center text-sm transition-all',
                                            selectedIcon === icon && 'bg-primary/20 ring-1 ring-primary'
                                        )}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            {/* Color selector */}
                            <div className="flex gap-1">
                                {HABIT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-transform',
                                            selectedColor === color && 'ring-2 ring-offset-1 ring-foreground scale-110'
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewHabitName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={addHabit}
                                    disabled={!newHabitName.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Day headers */}
                {habits.length > 0 && (
                    <div className="flex gap-1 pl-[60px]">
                        {recentDays.map((date) => (
                            <div
                                key={date}
                                className={cn(
                                    'flex-1 text-center text-[10px]',
                                    isSameDay(parseISO(date), new Date())
                                        ? 'text-primary font-bold'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {format(parseISO(date), 'EEE').charAt(0)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Habits list */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {habits.map((habit, index) => {
                        const streak = getStreak(habit);

                        return (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex items-center gap-1"
                            >
                                {/* Habit info */}
                                <div className="w-14 flex items-center gap-1">
                                    <span>{habit.icon}</span>
                                    <span className="text-[10px] text-foreground truncate flex-1">
                                        {habit.name}
                                    </span>
                                </div>

                                {/* Completion dots */}
                                <div className="flex-1 flex gap-1">
                                    {recentDays.map((date) => {
                                        const completed = isCompleted(habit, date);

                                        return (
                                            <button
                                                key={date}
                                                onClick={() => toggleCompletion(habit.id, date)}
                                                className={cn(
                                                    'flex-1 aspect-square max-w-[20px] rounded-sm transition-all',
                                                    completed
                                                        ? 'scale-100'
                                                        : 'scale-90 opacity-30 hover:opacity-60'
                                                )}
                                                style={{
                                                    backgroundColor: completed ? habit.color : habit.color + '40',
                                                }}
                                            >
                                                {completed && (
                                                    <Check className="w-full h-full p-0.5 text-white" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Streak */}
                                {streak > 0 && (
                                    <div className="flex items-center gap-0.5 px-1 rounded bg-orange-500/20">
                                        <Flame className="w-3 h-3 text-orange-500" />
                                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                                            {streak}
                                        </span>
                                    </div>
                                )}

                                {/* Delete */}
                                <button
                                    onClick={() => removeHabit(habit.id)}
                                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        );
                    })}

                    {/* Empty state */}
                    {habits.length === 0 && !isAdding && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Target className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-xs text-muted-foreground mb-2">
                                Track your daily habits
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Add habit
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default HabitTrackerWidget;
