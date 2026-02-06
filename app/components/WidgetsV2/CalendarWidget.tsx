/**
 * CalendarWidget v2
 * Mini calendar with current date display and event integration
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Circle, Clock, MapPin, AlertCircle } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
} from 'date-fns';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useCalendarStore } from '@/lib/stores/calendar.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface CalendarWidgetProps {
    id: string;
    settings?: {
        startWeekOnMonday?: boolean;
        showWeekNumbers?: boolean;
    };
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Mini calendar widget
 */
export function CalendarWidget({ id, settings }: CalendarWidgetProps) {
    const {
        currentMonth,
        selectedDate,
        events,
        error,
        fetchEvents,
        setCurrentMonth,
        setSelectedDate,
        goToToday: storeGoToToday
    } = useCalendarStore();

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const startWeekOnMonday = settings?.startWeekOnMonday ?? false;
    const weekdayLabels = startWeekOnMonday ? WEEKDAYS_MONDAY : WEEKDAYS;

    // Fetch events when month changes
    useEffect(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        // Expand range slightly to cover leading/trailing days if needed, 
        // but store handles primary range.
        fetchEvents(start, end);
    }, [currentMonth, fetchEvents]);

    // Get days for current month view
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: startWeekOnMonday ? 1 : 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: startWeekOnMonday ? 1 : 0 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth, startWeekOnMonday]);

    // Navigation
    const goToPreviousMonth = useCallback(() => {
        setCurrentMonth(subMonths(currentMonth, 1));
    }, [currentMonth, setCurrentMonth]);

    const goToNextMonth = useCallback(() => {
        setCurrentMonth(addMonths(currentMonth, 1));
    }, [currentMonth, setCurrentMonth]);

    const handleDateClick = useCallback((date: Date) => {
        setSelectedDate(isSameDay(date, selectedDate || new Date(0)) ? date : date);
    }, [selectedDate, setSelectedDate]);

    // Get events for specific date
    const getEventsForDay = useCallback((date: Date) => {
        return events.filter(e => isSameDay(new Date(e.start), date));
    }, [events]);

    const selectedDayEvents = useMemo(() => {
        return selectedDate ? getEventsForDay(selectedDate) : [];
    }, [selectedDate, getEventsForDay]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'today',
            icon: 'Calendar',
            label: 'Go to today',
            onClick: storeGoToToday,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Calendar"
            icon="Calendar"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2"
        >
            <div className="h-full flex flex-col gap-2">
                {/* Month navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={goToPreviousMonth}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <motion.span
                            key={format(currentMonth, 'yyyy-MM')}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-foreground"
                        >
                            {format(currentMonth, 'MMMM yyyy')}
                        </motion.span>
                        {error && (
                            <span title={error} className="flex items-center justify-center">
                                <AlertCircle
                                    className="w-3.5 h-3.5 text-destructive cursor-help"
                                />
                            </span>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={goToNextMonth}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0.5">
                    {weekdayLabels.map((day) => (
                        <div
                            key={day}
                            className="text-center text-[10px] font-medium text-muted-foreground py-1"
                        >
                            {day.charAt(0)}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 flex-1 relative">
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const dayIsToday = isToday(day);
                        const dayEvents = getEventsForDay(day);
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <motion.button
                                key={day.toISOString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.005 }}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    'aspect-square flex flex-col items-center justify-center rounded-md text-xs transition-all relative',
                                    !isCurrentMonth && 'text-muted-foreground/30',
                                    isCurrentMonth && 'text-foreground hover:bg-muted',
                                    dayIsToday && !isSelected && 'bg-primary/20 text-primary font-bold',
                                    isSelected && 'bg-primary text-primary-foreground font-bold shadow-md'
                                )}
                            >
                                <span>{format(day, 'd')}</span>
                                {hasEvents && (
                                    <div className="flex gap-0.5 mt-0.5 max-w-[80%] justify-center">
                                        {dayEvents.slice(0, 3).map((e, i) => (
                                            <div
                                                key={e.id}
                                                className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    isSelected ? "bg-white/70" : "bg-primary/60"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Selected date info - Events List */}
                <AnimatePresence>
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border/50 overflow-hidden flex flex-col max-h-[100px]"
                        >
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
                            </p>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <div key={event.id} className="text-xs bg-muted/40 p-1.5 rounded flex gap-2">
                                            <div className={cn("w-1 rounded-full self-stretch flex-shrink-0", event.colorId ? `bg-[${event.colorId}]` : "bg-primary")} />
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate font-medium">{event.summary}</p>
                                                {event.start && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {format(new Date(event.start), 'h:mm a')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-muted-foreground/60 italic p-1">
                                        No events planned
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WidgetWrapper>
    );
}

export default CalendarWidget;
