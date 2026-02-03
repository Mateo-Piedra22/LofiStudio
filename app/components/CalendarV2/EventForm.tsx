/**
 * EventForm Component
 * Create and edit calendar events
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CreateEventInput } from '@/lib/types/calendar.types';
import { format } from 'date-fns';

interface EventFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEventInput) => void;
    event?: CalendarEvent | null;
    defaultDate?: Date;
    isLoading?: boolean;
}

export function EventForm({
    open,
    onClose,
    onSubmit,
    event,
    defaultDate,
    isLoading,
}: EventFormProps) {
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allDay, setAllDay] = useState(false);

    const isEdit = !!event;

    // Initialize form
    useEffect(() => {
        if (event) {
            setSummary(event.summary);
            setDescription(event.description || '');
            setLocation(event.location || '');
            setStartDate(format(new Date(event.start), 'yyyy-MM-dd'));
            setStartTime(format(new Date(event.start), 'HH:mm'));
            setEndDate(format(new Date(event.end), 'yyyy-MM-dd'));
            setEndTime(format(new Date(event.end), 'HH:mm'));
            setAllDay(event.allDay || false);
        } else {
            // Reset for new event
            const baseDate = defaultDate || new Date();
            const startStr = format(baseDate, 'yyyy-MM-dd');
            setSummary('');
            setDescription('');
            setLocation('');
            setStartDate(startStr);
            setStartTime('09:00');
            setEndDate(startStr);
            setEndTime('10:00');
            setAllDay(false);
        }
    }, [event, defaultDate, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) return;

        let start: number;
        let end: number;

        if (allDay) {
            start = new Date(startDate).getTime();
            end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000) - 1;
        } else {
            start = new Date(`${startDate}T${startTime}`).getTime();
            end = new Date(`${endDate}T${endTime}`).getTime();
        }

        onSubmit({
            summary: summary.trim(),
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            start,
            end,
            allDay,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Edit Event' : 'New Event'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Summary */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Event name</label>
                            <Input
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="What's happening?"
                                autoFocus
                            />
                        </div>

                        {/* All day toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allDay"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="allDay" className="text-sm">
                                All day
                            </label>
                        </div>

                        {/* Date and time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    Start
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                {!allDay && (
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    End
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                {!allDay && (
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                Location
                            </label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Add location"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!summary.trim() || isLoading}>
                            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
