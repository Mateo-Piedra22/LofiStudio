/**
 * ClockWidget v2
 * Displays current time with customizable format
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface ClockWidgetProps {
    id: string;
    settings?: {
        format24h?: boolean;
        showSeconds?: boolean;
        showDate?: boolean;
    };
}

/**
 * Clock widget with 12/24 hour format toggle
 */
export function ClockWidget({ id, settings }: ClockWidgetProps) {
    const [time, setTime] = useState(new Date());
    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const updateWidgetSettings = useWidgetGridStore(state => state.updateWidgetSettings);

    // Settings with defaults
    const format24h = settings?.format24h ?? true;
    const showSeconds = settings?.showSeconds ?? true;
    const showDate = settings?.showDate ?? true;

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Toggle format
    const toggleFormat = useCallback(() => {
        updateWidgetSettings(id, {
            ...settings,
            format24h: !format24h
        });
    }, [id, settings, format24h, updateWidgetSettings]);

    // Format strings
    const timeFormat = format24h
        ? (showSeconds ? 'HH:mm:ss' : 'HH:mm')
        : (showSeconds ? 'hh:mm:ss a' : 'hh:mm a');

    const dateFormat = 'EEEE, MMMM d, yyyy';

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'toggle-format',
            icon: 'Clock',
            label: format24h ? 'Switch to 12h' : 'Switch to 24h',
            onClick: toggleFormat,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Clock"
            icon="Clock"
            showHeader={showHeaders}
            actions={actions}
            allowAlignment={true}
            contentClassName=""
        >
            <div className="space-y-1 px-4 flex flex-col justify-center">
                {/* Time */}
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight leading-none tabular-nums bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-md select-none">
                    {format(time, timeFormat)}
                </p>

                {/* Date */}
                {showDate && (
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide uppercase opacity-80 select-none">
                        {format(time, dateFormat)}
                    </p>
                )}
            </div>
        </WidgetWrapper>
    );
}

export default ClockWidget;
