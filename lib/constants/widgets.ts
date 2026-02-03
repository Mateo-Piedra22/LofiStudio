/**
 * Widget Definitions v2
 * Static metadata and configuration for all widgets
 */

import type { WidgetType, WidgetDefinition, WidgetCategory, WidgetSize, GridDimensions } from '../types/widget.types';

/**
 * Complete widget definitions
 */
export const WIDGET_DEFINITIONS: Record<WidgetType, WidgetDefinition> = {
    clock: {
        type: 'clock',
        label: 'Clock',
        description: 'Display current time with customizable format',
        icon: 'Clock',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x1',
        category: 'utility',
        defaultSettings: {
            format24h: true,
            showSeconds: true,
            showDate: true,
        },
    },
    worldtime: {
        type: 'worldtime',
        label: 'World Time',
        description: 'Track time across multiple timezones',
        icon: 'Globe',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'utility',
        defaultSettings: {
            timezones: ['UTC', 'America/New_York', 'Europe/London'],
        },
    },
    weather: {
        type: 'weather',
        label: 'Weather',
        description: 'Current weather and forecast',
        icon: 'Cloud',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x1',
        category: 'information',
        defaultSettings: {
            city: '',
            units: 'metric',
        },
    },
    gif: {
        type: 'gif',
        label: 'Animated GIF',
        description: 'Display lofi-themed animated GIFs',
        icon: 'Image',
        defaultSize: '1x2',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'entertainment',
        defaultSettings: {
            category: 'lofi',
            autoRefresh: true,
        },
    },
    tasks: {
        type: 'tasks',
        label: 'Tasks',
        description: 'Manage your to-do list',
        icon: 'CheckSquare',
        defaultSize: '1x2',
        minSize: '1x2',
        maxSize: '2x3',
        category: 'productivity',
        defaultSettings: {
            sortBy: 'dueDate',
            showCompleted: false,
        },
    },
    timer: {
        type: 'timer',
        label: 'Pomodoro Timer',
        description: 'Focus timer with work/break intervals',
        icon: 'Timer',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x1',
        category: 'productivity',
        defaultSettings: {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
        },
    },
    notes: {
        type: 'notes',
        label: 'Quick Notes',
        description: 'Jot down quick thoughts and ideas',
        icon: 'StickyNote',
        defaultSize: '1x2',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'productivity',
        defaultSettings: {
            autoSave: true,
        },
    },
    quote: {
        type: 'quote',
        label: 'Inspirational Quote',
        description: 'Daily motivation and wisdom',
        icon: 'Quote',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x1',
        category: 'wellness',
        defaultSettings: {
            category: 'motivation',
            language: 'en',
        },
    },
    calendar: {
        type: 'calendar',
        label: 'Calendar',
        description: 'View your schedule and events',
        icon: 'Calendar',
        defaultSize: '1x2',
        minSize: '1x2',
        maxSize: '2x3',
        category: 'productivity',
        defaultSettings: {
            startWeekOn: 'monday',
            showGoogleEvents: true,
        },
    },
    breathing: {
        type: 'breathing',
        label: 'Breathing Exercise',
        description: 'Guided breathing patterns for relaxation',
        icon: 'Wind',
        defaultSize: '1x2',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'wellness',
        defaultSettings: {
            pattern: '4-7-8',
        },
    },
    dictionary: {
        type: 'dictionary',
        label: 'Dictionary',
        description: 'Look up word definitions',
        icon: 'BookOpen',
        defaultSize: '1x2',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'utility',
        defaultSettings: {
            language: 'en',
        },
    },
    habit: {
        type: 'habit',
        label: 'Habit Tracker',
        description: 'Build and track daily habits',
        icon: 'Activity',
        defaultSize: '1x2',
        minSize: '1x2',
        maxSize: '2x2',
        category: 'productivity',
        defaultSettings: {
            habits: [],
        },
    },
    focus: {
        type: 'focus',
        label: 'Daily Focus',
        description: 'Set and track your main focus for the day',
        icon: 'Target',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x1',
        category: 'productivity',
        defaultSettings: {},
    },
    calculator: {
        type: 'calculator',
        label: 'Calculator',
        description: 'Simple calculator for quick math',
        icon: 'Calculator',
        defaultSize: '1x2',
        minSize: '1x2',
        maxSize: '1x2',
        category: 'utility',
        defaultSettings: {},
    },
    quicklinks: {
        type: 'quicklinks',
        label: 'Quick Links',
        description: 'Bookmark your favorite sites',
        icon: 'Link',
        defaultSize: '2x1',
        minSize: '1x1',
        maxSize: '3x1',
        category: 'utility',
        defaultSettings: {
            links: [],
        },
    },
    flashcard: {
        type: 'flashcard',
        label: 'Flashcards',
        description: 'Study with spaced repetition',
        icon: 'Layers',
        defaultSize: '1x1',
        minSize: '1x1',
        maxSize: '2x2',
        category: 'productivity',
        defaultSettings: {
            decks: [],
        },
    },
    embed: {
        type: 'embed',
        label: 'Web Embed',
        description: 'Embed external content',
        icon: 'ExternalLink',
        defaultSize: '2x2',
        minSize: '1x1',
        maxSize: '3x3',
        category: 'utility',
        defaultSettings: {
            url: '',
        },
    },
};

/**
 * All widget types as an array
 */
export const ALL_WIDGET_TYPES: WidgetType[] = Object.keys(WIDGET_DEFINITIONS) as WidgetType[];

/**
 * Widgets grouped by category
 */
export const WIDGETS_BY_CATEGORY: Record<WidgetCategory, WidgetType[]> = {
    productivity: ['tasks', 'timer', 'notes', 'calendar', 'habit', 'focus', 'flashcard'],
    information: ['weather'],
    entertainment: ['gif'],
    wellness: ['quote', 'breathing'],
    utility: ['clock', 'worldtime', 'dictionary', 'calculator', 'quicklinks', 'embed'],
};

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
    productivity: 'Productivity',
    information: 'Information',
    entertainment: 'Entertainment',
    wellness: 'Wellness',
    utility: 'Utility',
};

/**
 * Get widget definition by type
 */
export function getWidgetDefinition(type: WidgetType): WidgetDefinition {
    return WIDGET_DEFINITIONS[type];
}

/**
 * Get default size for a widget type
 */
export function getDefaultWidgetSize(type: WidgetType): WidgetSize {
    return WIDGET_DEFINITIONS[type].defaultSize;
}

/**
 * Get widget size dimensions
 */
export function getWidgetDimensions(size: WidgetSize): GridDimensions {
    const [cols, rows] = size.split('x').map(Number);
    return { cols, rows };
}

/**
 * Check if a widget can have a specific size
 */
export function isValidWidgetSize(type: WidgetType, size: WidgetSize): boolean {
    const def = WIDGET_DEFINITIONS[type];
    const requested = getWidgetDimensions(size);
    const min = getWidgetDimensions(def.minSize);
    const max = getWidgetDimensions(def.maxSize);

    return (
        requested.cols >= min.cols &&
        requested.cols <= max.cols &&
        requested.rows >= min.rows &&
        requested.rows <= max.rows
    );
}

/**
 * Calculate how many grid cells a widget occupies
 */
export function getWidgetCellCount(size: WidgetSize): number {
    const dims = getWidgetDimensions(size);
    return dims.cols * dims.rows;
}
