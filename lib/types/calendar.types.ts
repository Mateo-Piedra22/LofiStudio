/**
 * Calendar Types V2
 * Type definitions for calendar events and integration
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Core Event Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: number; // timestamp
    end: number;   // timestamp
    allDay?: boolean;
    location?: string;
    colorId?: string;

    // Source tracking
    source: 'local' | 'google_calendar';
    calendarId?: string;
    etag?: string;

    // UI
    color?: string;
}

export interface CalendarDay {
    date: Date;
    events: CalendarEvent[];
    isToday: boolean;
    isCurrentMonth: boolean;
    isSelected: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Google Calendar API Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: number;
    end: number;
    colorId?: string;
    location?: string;
}

export interface GoogleCalendar {
    id: string;
    summary: string;
    primary?: boolean;
    backgroundColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Event Form Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateEventInput {
    summary: string;
    description?: string;
    start: number;
    end: number;
    allDay?: boolean;
    location?: string;
    calendarId?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
    id: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface CalendarState {
    events: CalendarEvent[];
    calendars: GoogleCalendar[];
    selectedDate: Date;
    currentMonth: Date;
    isLoading: boolean;
    error: string | null;

    // Settings
    googleCalendarEnabled: boolean;
    defaultCalendarId: string | null;
    showOnlyUpcoming: boolean;
}

export interface CalendarActions {
    // Events
    fetchEvents: (timeMin: Date, timeMax: Date) => Promise<void>;
    createEvent: (event: CreateEventInput) => Promise<CalendarEvent | null>;
    updateEvent: (event: UpdateEventInput) => Promise<void>;
    deleteEvent: (id: string, calendarId?: string) => Promise<void>;

    // Navigation
    setSelectedDate: (date: Date) => void;
    setCurrentMonth: (date: Date) => void;
    goToToday: () => void;
    goToNextMonth: () => void;
    goToPreviousMonth: () => void;

    // Events for date
    getEventsForDate: (date: Date) => CalendarEvent[];
    getEventsForMonth: (date: Date) => CalendarEvent[];
    getUpcomingEvents: (limit?: number) => CalendarEvent[];

    // Settings
    setGoogleCalendarEnabled: (enabled: boolean) => void;
    setDefaultCalendarId: (id: string | null) => void;
}

export type CalendarStore = CalendarState & CalendarActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

export function isAllDayEvent(event: CalendarEvent): boolean {
    const duration = event.end - event.start;
    const hours = duration / (1000 * 60 * 60);
    return hours >= 23;
}

export function getEventDuration(event: CalendarEvent): string {
    const duration = event.end - event.start;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

export function formatEventTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}
