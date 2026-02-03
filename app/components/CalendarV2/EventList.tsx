/**
 * EventList Component
 * List of events for a selected date
 */

'use client';

import { memo, useEffect } from 'react';
import { CalendarDays, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalendarStore } from '@/lib/stores/calendar.store';
import { EventItem } from './EventItem';
import type { CalendarEvent } from '@/lib/types/calendar.types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventListProps {
    date: Date;
    onAddEvent?: () => void;
    className?: string;
    maxHeight?: string;
}

export const EventList = memo(function EventList({
    date,
    onAddEvent,
    className,
    maxHeight = '300px',
}: EventListProps) {
    const events = useCalendarStore(s => s.getEventsForDate(date));
    const deleteEvent = useCalendarStore(s => s.deleteEvent);
    const fetchEvents = useCalendarStore(s => s.fetchEvents);
    const isLoading = useCalendarStore(s => s.isLoading);
    const googleCalendarEnabled = useCalendarStore(s => s.googleCalendarEnabled);

    // Fetch events for the month when date changes
    useEffect(() => {
        if (googleCalendarEnabled) {
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            fetchEvents(monthStart, monthEnd);
        }
    }, [date.getMonth(), date.getFullYear(), googleCalendarEnabled, fetchEvents]);

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                        {format(date, 'EEEE, MMMM d')}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {googleCalendarEnabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => fetchEvents(startOfMonth(date), endOfMonth(date))}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                        </Button>
                    )}

                    {onAddEvent && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onAddEvent}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Event list */}
            <ScrollArea style={{ maxHeight }} className="flex-1">
                {events.length > 0 ? (
                    <div className="space-y-2">
                        {events.map(event => (
                            <EventItem
                                key={event.id}
                                event={event}
                                onDelete={(id) => deleteEvent(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events for this day</p>
                        {onAddEvent && (
                            <Button
                                variant="link"
                                size="sm"
                                className="mt-1"
                                onClick={onAddEvent}
                            >
                                Add an event
                            </Button>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
});
