/**
 * WidgetsV2 Index
 * Central export for all v2 widgets (fully rebuilt)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Simple Widgets (Grupo 1)
// ═══════════════════════════════════════════════════════════════════════════════

export { ClockWidget } from './ClockWidget';
export { QuoteWidget } from './QuoteWidget';
export { NotesWidget } from './NotesWidget';
export { WeatherWidget } from './WeatherWidget';
export { WorldTimeWidget } from './WorldTimeWidget';
export { CalculatorWidget } from './CalculatorWidget';

// ═══════════════════════════════════════════════════════════════════════════════
// Medium Widgets (Grupo 2)
// ═══════════════════════════════════════════════════════════════════════════════

export { TimerWidget } from './TimerWidget';
export { GifWidget } from './GifWidget';
export { DictionaryWidget } from './DictionaryWidget';
export { BreathingWidget } from './BreathingWidget';
export { DailyFocusWidget } from './DailyFocusWidget';
export { QuickLinksWidget } from './QuickLinksWidget';

// ═══════════════════════════════════════════════════════════════════════════════
// Complex Widgets (Grupo 3)
// ═══════════════════════════════════════════════════════════════════════════════

export { CalendarWidget } from './CalendarWidget';
export { TasksWidget } from './TasksWidget';
export { HabitTrackerWidget } from './HabitTrackerWidget';
export { FlashcardWidget } from './FlashcardWidget';
export { EmbedWidget } from './EmbedWidget';

// ═══════════════════════════════════════════════════════════════════════════════
// Widget Type Map (for dynamic rendering)
// ═══════════════════════════════════════════════════════════════════════════════

import { ClockWidget } from './ClockWidget';
import { QuoteWidget } from './QuoteWidget';
import { NotesWidget } from './NotesWidget';
import { WeatherWidget } from './WeatherWidget';
import { WorldTimeWidget } from './WorldTimeWidget';
import { CalculatorWidget } from './CalculatorWidget';
import { TimerWidget } from './TimerWidget';
import { GifWidget } from './GifWidget';
import { DictionaryWidget } from './DictionaryWidget';
import { BreathingWidget } from './BreathingWidget';
import { DailyFocusWidget } from './DailyFocusWidget';
import { QuickLinksWidget } from './QuickLinksWidget';
import { CalendarWidget } from './CalendarWidget';
import { TasksWidget } from './TasksWidget';
import { HabitTrackerWidget } from './HabitTrackerWidget';
import { FlashcardWidget } from './FlashcardWidget';
import { EmbedWidget } from './EmbedWidget';

export const WIDGET_COMPONENTS = {
    clock: ClockWidget,
    worldtime: WorldTimeWidget,
    weather: WeatherWidget,
    gif: GifWidget,
    tasks: TasksWidget,
    timer: TimerWidget,
    notes: NotesWidget,
    quote: QuoteWidget,
    calendar: CalendarWidget,
    breathing: BreathingWidget,
    dictionary: DictionaryWidget,
    habit: HabitTrackerWidget,
    focus: DailyFocusWidget,
    calculator: CalculatorWidget,
    quicklinks: QuickLinksWidget,
    flashcard: FlashcardWidget,
    embed: EmbedWidget,
} as const;

export type WidgetType = keyof typeof WIDGET_COMPONENTS;
