/**
 * UpcomingEvents Component
 * Widget showing upcoming calendar events
 */

'use client';

import { useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarStore } from '@/lib/stores/calendar.store';
import { EventItem } from './EventItem';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

interface UpcomingEventsProps {
    limit?: number;
    className?: string;
    onViewAll?: () => void;
    compact?: boolean;
}

export function UpcomingEvents({
    limit = 5,
    className,
    onViewAll,
    compact = false,
}: UpcomingEventsProps) {
    const events = useCalendarStore(s => s.getUpcomingEvents(limit));
    const fetchEvents = useCalendarStore(s => s.fetchEvents);
    const googleCalendarEnabled = useCalendarStore(s => s.googleCalendarEnabled);
    const isLoading = useCalendarStore(s => s.isLoading);
    const deleteEvent = useCalendarStore(s => s.deleteEvent);

    // Fetch events for next 2 months
    useEffect(() => {
        if (googleCalendarEnabled) {
            const now = new Date();
            const futureDate = addMonths(now, 2);
            fetchEvents(now, futureDate);
        }
    }, [googleCalendarEnabled, fetchEvents]);

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Events
                </h4>

                {onViewAll && events.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={onViewAll}
                    >
                        View All
                        <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                )}
            </div>

            {/* Event list */}
            {isLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading events...
                </div>
            ) : events.length > 0 ? (
                <div className="space-y-2">
                    {events.map(event => (
                        <EventItem
                            key={event.id}
                            event={event}
                            compact={compact}
                            showDate
                            onDelete={id => deleteEvent(id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No upcoming events</p>
                    {!googleCalendarEnabled && (
                        <p className="text-xs mt-1 opacity-70">
                            Enable Google Calendar in settings
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
