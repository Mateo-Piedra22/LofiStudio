/**
 * EventItem Component
 * Individual calendar event display
 */

'use client';

import { memo } from 'react';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types/calendar.types';
import { format } from 'date-fns';

interface EventItemProps {
    event: CalendarEvent;
    onDelete?: (id: string) => void;
    compact?: boolean;
    showDate?: boolean;
}

const colorMap: Record<string, string> = {
    '1': 'bg-blue-500/20 border-blue-500/30',
    '2': 'bg-green-500/20 border-green-500/30',
    '3': 'bg-purple-500/20 border-purple-500/30',
    '4': 'bg-red-500/20 border-red-500/30',
    '5': 'bg-yellow-500/20 border-yellow-500/30',
    '6': 'bg-orange-500/20 border-orange-500/30',
    '7': 'bg-cyan-500/20 border-cyan-500/30',
    '8': 'bg-gray-500/20 border-gray-500/30',
    '9': 'bg-indigo-500/20 border-indigo-500/30',
    '10': 'bg-emerald-500/20 border-emerald-500/30',
    '11': 'bg-rose-500/20 border-rose-500/30',
};

function formatEventTime(timestamp: number): string {
    return format(new Date(timestamp), 'h:mm a');
}

function isAllDayEvent(event: CalendarEvent): boolean {
    const duration = event.end - event.start;
    const hours = duration / (1000 * 60 * 60);
    return hours >= 23;
}

export const EventItem = memo(function EventItem({
    event,
    onDelete,
    compact = false,
    showDate = false,
}: EventItemProps) {
    const colorClass = event.colorId ? colorMap[event.colorId] || colorMap['1'] : 'bg-primary/10 border-primary/20';
    const allDay = isAllDayEvent(event);

    return (
        <div
            className={cn(
                'rounded-lg border p-3 transition-colors hover:bg-accent/30',
                colorClass
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p className={cn(
                        'font-medium truncate',
                        compact ? 'text-xs' : 'text-sm'
                    )}>
                        {event.summary}
                    </p>

                    {/* Time */}
                    <div className={cn(
                        'flex items-center gap-2 text-muted-foreground mt-1',
                        compact ? 'text-[10px]' : 'text-xs'
                    )}>
                        {showDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.start), 'MMM d')}
                            </span>
                        )}

                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {allDay ? (
                                'All day'
                            ) : (
                                `${formatEventTime(event.start)} - ${formatEventTime(event.end)}`
                            )}
                        </span>
                    </div>

                    {/* Location (if not compact) */}
                    {!compact && event.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                        </p>
                    )}

                    {/* Description (if not compact) */}
                    {!compact && event.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                        </p>
                    )}
                </div>

                {/* Delete button */}
                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => onDelete(event.id)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
});
