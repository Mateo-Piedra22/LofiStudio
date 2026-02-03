/**
 * CalendarWidget v2
 * Mini calendar with current date display
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const startWeekOnMonday = settings?.startWeekOnMonday ?? false;
    const weekdayLabels = startWeekOnMonday ? WEEKDAYS_MONDAY : WEEKDAYS;

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
        setCurrentMonth(prev => subMonths(prev, 1));
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const goToToday = useCallback(() => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    }, []);

    // Select date
    const handleDateClick = useCallback((date: Date) => {
        setSelectedDate(isSameDay(date, selectedDate || new Date(0)) ? null : date);
    }, [selectedDate]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'today',
            icon: 'Calendar',
            label: 'Go to today',
            onClick: goToToday,
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

                    <motion.span
                        key={format(currentMonth, 'yyyy-MM')}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium text-foreground"
                    >
                        {format(currentMonth, 'MMMM yyyy')}
                    </motion.span>

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
                <div className="grid grid-cols-7 gap-0.5 flex-1">
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const dayIsToday = isToday(day);

                        return (
                            <motion.button
                                key={day.toISOString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.01 }}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    'aspect-square flex items-center justify-center rounded-md text-xs transition-colors',
                                    !isCurrentMonth && 'text-muted-foreground/40',
                                    isCurrentMonth && 'text-foreground hover:bg-muted',
                                    dayIsToday && !isSelected && 'bg-primary/20 text-primary font-bold',
                                    isSelected && 'bg-primary text-primary-foreground font-bold'
                                )}
                            >
                                {format(day, 'd')}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Selected date info */}
                <AnimatePresence>
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border/50 text-center"
                        >
                            <p className="text-xs text-muted-foreground">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </p>
                            {isToday(selectedDate) && (
                                <p className="text-xs text-primary font-medium mt-0.5">
                                    Today
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WidgetWrapper>
    );
}

export default CalendarWidget;
