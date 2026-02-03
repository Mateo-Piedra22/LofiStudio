/**
 * WorldTimeWidget v2
 * Displays multiple timezone clocks using native Intl API
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, X, Check } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface TimezoneEntry {
    id: string;
    timezone: string;
    label: string;
}

interface WorldTimeWidgetProps {
    id: string;
    settings?: {
        timezones?: TimezoneEntry[];
    };
}

// Popular timezones
const POPULAR_TIMEZONES = [
    { timezone: 'America/New_York', label: 'New York' },
    { timezone: 'America/Los_Angeles', label: 'Los Angeles' },
    { timezone: 'America/Chicago', label: 'Chicago' },
    { timezone: 'America/Sao_Paulo', label: 'São Paulo' },
    { timezone: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
    { timezone: 'Europe/London', label: 'London' },
    { timezone: 'Europe/Paris', label: 'Paris' },
    { timezone: 'Europe/Berlin', label: 'Berlin' },
    { timezone: 'Europe/Madrid', label: 'Madrid' },
    { timezone: 'Asia/Tokyo', label: 'Tokyo' },
    { timezone: 'Asia/Shanghai', label: 'Shanghai' },
    { timezone: 'Asia/Dubai', label: 'Dubai' },
    { timezone: 'Asia/Singapore', label: 'Singapore' },
    { timezone: 'Australia/Sydney', label: 'Sydney' },
    { timezone: 'Pacific/Auckland', label: 'Auckland' },
];

const DEFAULT_TIMEZONES: TimezoneEntry[] = [
    { id: '1', timezone: 'America/New_York', label: 'New York' },
    { id: '2', timezone: 'Europe/London', label: 'London' },
    { id: '3', timezone: 'Asia/Tokyo', label: 'Tokyo' },
];

const STORAGE_KEY = 'lofi-world-time-v2';

/**
 * Format time for a specific timezone using Intl.DateTimeFormat
 */
function formatTimeInTimezone(date: Date, timezone: string, formatStr: 'time' | 'full'): string {
    try {
        const options: Intl.DateTimeFormatOptions = formatStr === 'time'
            ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone }
            : { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone };

        return new Intl.DateTimeFormat('en-GB', options).format(date);
    } catch {
        return '--:--:--';
    }
}

/**
 * Get timezone offset difference from local
 */
function getTimezoneOffset(date: Date, timezone: string): number {
    try {
        // Get local offset in minutes
        const localOffset = date.getTimezoneOffset();

        // Create a date string in the target timezone
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const localDate = new Date(date.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

        // Calculate difference in hours
        const diffMs = tzDate.getTime() - localDate.getTime();
        return Math.round(diffMs / (1000 * 60 * 60));
    } catch {
        return 0;
    }
}

/**
 * World time zones widget
 */
export function WorldTimeWidget({ id, settings }: WorldTimeWidgetProps) {
    const [time, setTime] = useState(new Date());
    const [timezones, setTimezones] = useState<TimezoneEntry[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Load timezones
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setTimezones(JSON.parse(saved));
            } else if (settings?.timezones) {
                setTimezones(settings.timezones);
            } else {
                setTimezones(DEFAULT_TIMEZONES);
            }
        } catch (e) {
            setTimezones(DEFAULT_TIMEZONES);
        }
    }, [settings?.timezones]);

    // Save timezones
    useEffect(() => {
        if (typeof window === 'undefined' || timezones.length === 0) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timezones));
    }, [timezones]);

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Add timezone
    const addTimezone = useCallback((tz: typeof POPULAR_TIMEZONES[0]) => {
        const newEntry: TimezoneEntry = {
            id: Date.now().toString(),
            timezone: tz.timezone,
            label: tz.label,
        };
        setTimezones(prev => [...prev, newEntry]);
        setShowAdd(false);
        setSearchQuery('');
    }, []);

    // Remove timezone
    const removeTimezone = useCallback((tzId: string) => {
        setTimezones(prev => prev.filter(t => t.id !== tzId));
    }, []);

    // Filter timezones for search
    const filteredTimezones = useMemo(() =>
        POPULAR_TIMEZONES.filter(tz =>
            tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tz.timezone.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]);

    // Get time difference string
    const getTimeDiff = useCallback((timezone: string): string => {
        const diff = getTimezoneOffset(time, timezone);
        if (diff === 0) return 'Same time';
        return diff > 0 ? `+${diff}h` : `${diff}h`;
    }, [time]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'add',
            icon: showAdd ? 'X' : 'Plus',
            label: showAdd ? 'Cancel' : 'Add timezone',
            onClick: () => setShowAdd(!showAdd),
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="World Time"
            icon="Globe"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-3 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-2 overflow-hidden">
                {/* Add timezone panel */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city..."
                                className="h-8 text-sm"
                                autoFocus
                            />
                            <div className="max-h-24 overflow-y-auto space-y-1">
                                {filteredTimezones.slice(0, 5).map((tz) => (
                                    <button
                                        key={tz.timezone}
                                        onClick={() => addTimezone(tz)}
                                        disabled={timezones.some(t => t.timezone === tz.timezone)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-2 py-1 text-xs rounded',
                                            'hover:bg-muted transition-colors',
                                            timezones.some(t => t.timezone === tz.timezone) && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <span>{tz.label}</span>
                                        {timezones.some(t => t.timezone === tz.timezone) ? (
                                            <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Plus className="w-3 h-3" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timezone list */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {timezones.map((tz, index) => (
                        <motion.div
                            key={tz.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground truncate">
                                        {tz.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground/60">
                                        {getTimeDiff(tz.timezone)}
                                    </span>
                                </div>
                                <p className="text-lg font-bold font-mono text-foreground">
                                    {formatTimeInTimezone(time, tz.timezone, 'time')}
                                </p>
                            </div>

                            {/* Remove button */}
                            <button
                                onClick={() => removeTimezone(tz.id)}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                aria-label={`Remove ${tz.label}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}

                    {timezones.length === 0 && !showAdd && (
                        <div className="h-full flex items-center justify-center text-center">
                            <div className="space-y-2">
                                <Globe className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                                <p className="text-xs text-muted-foreground">
                                    No timezones added
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAdd(true)}
                                    className="text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add timezone
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default WorldTimeWidget;
