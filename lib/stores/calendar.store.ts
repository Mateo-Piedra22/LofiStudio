/**
 * Calendar Store V2
 * Zustand store for calendar events with Google Calendar integration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    isSameDay,
    isWithinInterval,
    isAfter,
} from 'date-fns';
import type {
    CalendarStore,
    CalendarState,
    CalendarEvent,
    GoogleCalendar,
    CreateEventInput,
    UpdateEventInput,
} from '@/lib/types/calendar.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-calendar-v2';

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: CalendarState = {
    events: [],
    calendars: [],
    selectedDate: new Date(),
    currentMonth: new Date(),
    isLoading: false,
    error: null,
    googleCalendarEnabled: false,
    defaultCalendarId: null,
    showOnlyUpcoming: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useCalendarStore = create<CalendarStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────────
            // Event Operations
            // ─────────────────────────────────────────────────────────────────────────

            fetchEvents: async (timeMin: Date, timeMax: Date) => {
                const state = get();
                if (!state.googleCalendarEnabled) return;

                set({ isLoading: true, error: null });

                try {
                    const params = new URLSearchParams({
                        timeMin: timeMin.toISOString(),
                        timeMax: timeMax.toISOString(),
                    });

                    const res = await fetch(`/api/google/calendar/events?${params}`);

                    if (!res.ok) {
                        if (res.status === 401 || res.status === 403) {
                            set({ isLoading: false, error: 'Not authorized for Google Calendar' });
                            return;
                        }
                        throw new Error('Failed to fetch events');
                    }

                    const data = await res.json();

                    const events: CalendarEvent[] = (data.events || []).map((e: any) => ({
                        id: e.id,
                        summary: e.summary,
                        description: e.description,
                        start: e.start,
                        end: e.end,
                        location: e.location,
                        colorId: e.colorId,
                        source: 'google_calendar' as const,
                        calendarId: 'primary',
                    }));

                    // Merge with existing local events
                    set(prev => ({
                        events: [
                            ...prev.events.filter(e => e.source === 'local'),
                            ...events,
                        ],
                        isLoading: false,
                    }));
                } catch (error) {
                    const err = error as Error;
                    set({ isLoading: false, error: err.message });
                }
            },

            createEvent: async (input: CreateEventInput) => {
                const state = get();

                // Create locally first
                const localEvent: CalendarEvent = {
                    id: crypto.randomUUID(),
                    summary: input.summary,
                    description: input.description,
                    start: input.start,
                    end: input.end,
                    allDay: input.allDay,
                    location: input.location,
                    source: 'local',
                };

                set(prev => ({
                    events: [...prev.events, localEvent],
                }));

                // Sync to Google if enabled
                if (state.googleCalendarEnabled) {
                    try {
                        const res = await fetch('/api/google/calendar/events', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                summary: input.summary,
                                description: input.description,
                                start: input.start,
                                end: input.end,
                                calendarId: input.calendarId || state.defaultCalendarId || 'primary',
                            }),
                        });

                        if (res.ok) {
                            const data = await res.json();
                            // Update local event with Google ID
                            set(prev => ({
                                events: prev.events.map(e =>
                                    e.id === localEvent.id
                                        ? {
                                            ...e,
                                            id: data.event.id,
                                            source: 'google_calendar' as const,
                                            calendarId: input.calendarId || state.defaultCalendarId || 'primary',
                                        }
                                        : e
                                ),
                            }));

                            return { ...localEvent, id: data.event.id, source: 'google_calendar' as const };
                        }
                    } catch (error) {
                        console.error('Failed to sync event to Google Calendar:', error);
                    }
                }

                return localEvent;
            },

            updateEvent: async (input: UpdateEventInput) => {
                const state = get();
                const event = state.events.find(e => e.id === input.id);
                if (!event) return;

                // Update locally
                set(prev => ({
                    events: prev.events.map(e =>
                        e.id === input.id ? { ...e, ...input } : e
                    ),
                }));

                // Sync to Google if it's a Google event
                if (event.source === 'google_calendar' && state.googleCalendarEnabled) {
                    try {
                        const { id: _id, ...updatePayload } = input;
                        await fetch('/api/google/calendar/events', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: input.id,
                                calendarId: event.calendarId || 'primary',
                                ...updatePayload,
                            }),
                        });
                    } catch (error) {
                        console.error('Failed to update event in Google Calendar:', error);
                    }
                }
            },

            deleteEvent: async (id: string, calendarId?: string) => {
                const state = get();
                const event = state.events.find(e => e.id === id);
                if (!event) return;

                // Remove locally
                set(prev => ({
                    events: prev.events.filter(e => e.id !== id),
                }));

                // Delete from Google if it's a Google event
                if (event.source === 'google_calendar' && state.googleCalendarEnabled) {
                    try {
                        await fetch('/api/google/calendar/events', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id,
                                calendarId: calendarId || event.calendarId || 'primary',
                            }),
                        });
                    } catch (error) {
                        console.error('Failed to delete event from Google Calendar:', error);
                    }
                }
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Navigation
            // ─────────────────────────────────────────────────────────────────────────

            setSelectedDate: (date: Date) => {
                set({ selectedDate: date });
            },

            setCurrentMonth: (date: Date) => {
                set({ currentMonth: date });
            },

            goToToday: () => {
                const today = new Date();
                set({
                    selectedDate: today,
                    currentMonth: today,
                });
            },

            goToNextMonth: () => {
                set(prev => ({
                    currentMonth: addMonths(prev.currentMonth, 1),
                }));
            },

            goToPreviousMonth: () => {
                set(prev => ({
                    currentMonth: subMonths(prev.currentMonth, 1),
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Event Queries
            // ─────────────────────────────────────────────────────────────────────────

            getEventsForDate: (date: Date) => {
                const events = get().events;
                return events.filter(event => {
                    const eventStart = new Date(event.start);
                    return isSameDay(eventStart, date);
                }).sort((a, b) => a.start - b.start);
            },

            getEventsForMonth: (date: Date) => {
                const events = get().events;
                const monthStart = startOfMonth(date);
                const monthEnd = endOfMonth(date);

                return events.filter(event => {
                    const eventStart = new Date(event.start);
                    return isWithinInterval(eventStart, { start: monthStart, end: monthEnd });
                }).sort((a, b) => a.start - b.start);
            },

            getUpcomingEvents: (limit = 5) => {
                const events = get().events;
                const now = new Date();

                return events
                    .filter(event => isAfter(new Date(event.start), now))
                    .sort((a, b) => a.start - b.start)
                    .slice(0, limit);
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Settings
            // ─────────────────────────────────────────────────────────────────────────

            setGoogleCalendarEnabled: (enabled: boolean) => {
                set({ googleCalendarEnabled: enabled });

                if (enabled) {
                    // Fetch events for current month
                    const state = get();
                    const monthStart = startOfMonth(state.currentMonth);
                    const monthEnd = endOfMonth(state.currentMonth);
                    get().fetchEvents(monthStart, monthEnd);
                }
            },

            setDefaultCalendarId: (id: string | null) => {
                set({ defaultCalendarId: id });
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                events: state.events.filter(e => e.source === 'local').slice(0, 100),
                googleCalendarEnabled: state.googleCalendarEnabled,
                defaultCalendarId: state.defaultCalendarId,
                showOnlyUpcoming: state.showOnlyUpcoming,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useEventsForDate(date: Date): CalendarEvent[] {
    return useCalendarStore(state => state.getEventsForDate(date));
}

export function useUpcomingEvents(limit = 5): CalendarEvent[] {
    return useCalendarStore(state => state.getUpcomingEvents(limit));
}

export function useCalendarNavigation() {
    return useCalendarStore(state => ({
        currentMonth: state.currentMonth,
        selectedDate: state.selectedDate,
        goToToday: state.goToToday,
        goToNextMonth: state.goToNextMonth,
        goToPreviousMonth: state.goToPreviousMonth,
        setSelectedDate: state.setSelectedDate,
        setCurrentMonth: state.setCurrentMonth,
    }));
}
