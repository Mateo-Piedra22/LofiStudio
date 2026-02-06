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

export function WorldTimeWidget({ id, settings }: WorldTimeWidgetProps) {
    const [time, setTime] = useState(new Date());
    const showAddState = useState(false);
    const [showAdd, setShowAdd] = showAddState;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ id: string, label: string, timezone: string, country: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const updateWidgetSettings = useWidgetGridStore(state => state.updateWidgetSettings);
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Derive timezones from settings (Store is source of truth)
    const timezones = useMemo(() => settings?.timezones || DEFAULT_TIMEZONES, [settings?.timezones]);

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Search Cities via API
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`);
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();

                if (data.results) {
                    const mapped = data.results
                        .filter((item: any) => item.timezone)
                        .map((item: any) => ({
                            id: `${item.id}`,
                            label: item.name,
                            timezone: item.timezone,
                            country: item.country_code
                        }));
                    setSearchResults(mapped);
                } else {
                    setSearchResults([]);
                }
            } catch (e) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);


    // Add timezone
    const addTimezone = useCallback((entry: { label: string, timezone: string, country?: string }) => {
        const newEntry: TimezoneEntry = {
            id: Date.now().toString(),
            timezone: entry.timezone,
            label: entry.label,
        };
        updateWidgetSettings(id, { timezones: [...timezones, newEntry] });
        setShowAdd(false);
        setSearchQuery('');
        setSearchResults([]);
    }, [id, timezones, updateWidgetSettings]);

    // Remove timezone
    const removeTimezone = useCallback((tzId: string) => {
        const newTimezones = timezones.filter(t => t.id !== tzId);
        updateWidgetSettings(id, { timezones: newTimezones });
    }, [id, timezones, updateWidgetSettings]);

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
                            className="space-y-2 mb-2"
                        >
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city (London, Tokyo)..."
                                className="h-8 text-sm"
                                autoFocus
                            />
                            {/* Results List */}
                            <div className="max-h-32 overflow-y-auto space-y-1 bg-muted/20 rounded-md p-1 border border-border/50">
                                {isSearching && <div className="p-2 text-xs text-center text-muted-foreground">Searching...</div>}

                                {!isSearching && searchResults.length === 0 && searchQuery.length > 2 && (
                                    <div className="p-2 text-xs text-center text-muted-foreground">No cities found</div>
                                )}

                                {!isSearching && searchResults.map((city) => (
                                    <button
                                        key={city.id}
                                        onClick={() => addTimezone(city)}
                                        disabled={timezones.some(t => t.timezone === city.timezone && t.label === city.label)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded',
                                            'hover:bg-primary/10 hover:text-primary transition-colors text-left',
                                            timezones.some(t => t.timezone === city.timezone && t.label === city.label) && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{city.label}</span>
                                            <span className="text-[10px] text-muted-foreground">{city.country} • {city.timezone}</span>
                                        </div>
                                        {timezones.some(t => t.timezone === city.timezone && t.label === city.label) ? (
                                            <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        )}
                                    </button>
                                ))}

                                {!isSearching && searchResults.length === 0 && searchQuery.length <= 2 && (
                                    <div className="p-2 text-xs text-muted-foreground text-center">Type to search world cities</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timezone list */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {timezones.map((tz, index) => (
                        <motion.div
                            key={tz.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className="group relative flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/15 hover:shadow-md"
                        >
                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                    <span className="text-sm font-semibold text-foreground truncate tracking-tight">
                                        {tz.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground/80 font-medium uppercase tracking-wider">
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-sky-200/80">{getTimeDiff(tz.timezone)}</span>
                                    <span>{tz.timezone?.split('/')[0] || 'World'}</span>
                                </div>
                            </div>

                            <div className="text-right relative z-10">
                                <p className="text-xl font-bold font-mono tracking-tight tabular-nums bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent drop-shadow-sm">
                                    {formatTimeInTimezone(time, tz.timezone, 'time')}
                                </p>
                            </div>

                            {/* Remove button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeTimezone(tz.id); }}
                                className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all z-20"
                                aria-label={`Remove ${tz.label}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}

                    {timezones.length === 0 && !showAdd && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <Globe className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">No clocks added</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAdd(true)}
                                className="text-xs"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Location
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default WorldTimeWidget;
