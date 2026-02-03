/**
 * DailyFocusWidget v2
 * Daily focus/intention setting with progress tracking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, Edit2, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface FocusItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

interface DailyFocusData {
    date: string;
    mainFocus: string;
    items: FocusItem[];
}

interface DailyFocusWidgetProps {
    id: string;
    settings?: {
        maxItems?: number;
    };
}

const STORAGE_KEY = 'lofi-daily-focus-v2';

/**
 * Daily focus and intention widget
 */
export function DailyFocusWidget({ id, settings }: DailyFocusWidgetProps) {
    const [data, setData] = useState<DailyFocusData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingFocus, setEditingFocus] = useState('');
    const [newItem, setNewItem] = useState('');
    const [showAddItem, setShowAddItem] = useState(false);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const maxItems = settings?.maxItems ?? 3;
    const today = format(new Date(), 'yyyy-MM-dd');

    // Load data
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: DailyFocusData = JSON.parse(saved);
                // Check if it's today's data
                if (parsed.date === today) {
                    setData(parsed);
                } else {
                    // Reset for new day
                    setData(null);
                }
            }
        } catch (e) {
            console.error('Failed to load focus data:', e);
        }
    }, [today]);

    // Save data
    const saveData = useCallback((newData: DailyFocusData) => {
        setData(newData);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        }
    }, []);

    // Set main focus
    const setMainFocus = useCallback(() => {
        if (!editingFocus.trim()) return;

        const newData: DailyFocusData = {
            date: today,
            mainFocus: editingFocus.trim(),
            items: data?.items || [],
        };

        saveData(newData);
        setIsEditing(false);
        setEditingFocus('');
    }, [editingFocus, today, data, saveData]);

    // Add item
    const addItem = useCallback(() => {
        if (!newItem.trim() || !data) return;
        if (data.items.length >= maxItems) return;

        const item: FocusItem = {
            id: Date.now().toString(),
            text: newItem.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        saveData({
            ...data,
            items: [...data.items, item],
        });

        setNewItem('');
        setShowAddItem(false);
    }, [newItem, data, maxItems, saveData]);

    // Toggle item
    const toggleItem = useCallback((itemId: string) => {
        if (!data) return;

        saveData({
            ...data,
            items: data.items.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
        });
    }, [data, saveData]);

    // Remove item
    const removeItem = useCallback((itemId: string) => {
        if (!data) return;

        saveData({
            ...data,
            items: data.items.filter(item => item.id !== itemId),
        });
    }, [data, saveData]);

    // Calculate progress
    const progress = data?.items.length
        ? (data.items.filter(i => i.completed).length / data.items.length) * 100
        : 0;

    // Actions
    const actions: WidgetAction[] = data ? [
        {
            id: 'edit',
            icon: 'Edit2',
            label: 'Edit focus',
            onClick: () => {
                setEditingFocus(data.mainFocus);
                setIsEditing(true);
            },
        },
    ] : [];

    return (
        <WidgetWrapper
            id={id}
            title="Daily Focus"
            icon="Target"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-3 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-3 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* No focus set */}
                    {!data && !isEditing && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center"
                        >
                            <Target className="w-10 h-10 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">
                                What's your focus today?
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Set focus
                            </Button>
                        </motion.div>
                    )}

                    {/* Editing mode */}
                    {isEditing && (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                        >
                            <p className="text-xs text-muted-foreground">Today's main focus:</p>
                            <Input
                                value={editingFocus}
                                onChange={(e) => setEditingFocus(e.target.value)}
                                placeholder="What's your #1 priority?"
                                className="h-9 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setMainFocus();
                                    if (e.key === 'Escape') {
                                        setIsEditing(false);
                                        setEditingFocus('');
                                    }
                                }}
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingFocus('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={setMainFocus}
                                    disabled={!editingFocus.trim()}
                                >
                                    <Check className="w-3 h-3 mr-1" />
                                    Save
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Focus display */}
                    {data && !isEditing && (
                        <motion.div
                            key="display"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full gap-3 overflow-hidden"
                        >
                            {/* Main focus */}
                            <div className="text-center pb-2 border-b border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Today's Focus
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {data.mainFocus}
                                </p>
                            </div>

                            {/* Progress bar */}
                            {data.items.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Items list */}
                            <div className="flex-1 overflow-y-auto space-y-1">
                                {data.items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className={cn(
                                                'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                                                item.completed
                                                    ? 'bg-primary border-primary'
                                                    : 'border-border hover:border-primary'
                                            )}
                                        >
                                            {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </button>
                                        <span className={cn(
                                            'flex-1 text-xs truncate',
                                            item.completed && 'line-through text-muted-foreground'
                                        )}>
                                            {item.text}
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}

                                {/* Add item */}
                                {data.items.length < maxItems && (
                                    <>
                                        {showAddItem ? (
                                            <div className="flex gap-1">
                                                <Input
                                                    value={newItem}
                                                    onChange={(e) => setNewItem(e.target.value)}
                                                    placeholder="Add sub-task..."
                                                    className="h-7 text-xs flex-1"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') addItem();
                                                        if (e.key === 'Escape') {
                                                            setShowAddItem(false);
                                                            setNewItem('');
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={addItem}
                                                    disabled={!newItem.trim()}
                                                >
                                                    <Check className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddItem(true)}
                                                className="w-full flex items-center gap-2 p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add sub-task
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WidgetWrapper>
    );
}

export default DailyFocusWidget;
