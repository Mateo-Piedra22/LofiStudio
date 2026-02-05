import {
    ClockWidget,
    WorldTimeWidget,
    QuoteWidget,
    NotesWidget,
    WeatherWidget,
    GifWidget,
    CalculatorWidget,
    TimerWidget,
    DictionaryWidget,
    BreathingWidget,
    DailyFocusWidget,
    QuickLinksWidget,
    CalendarWidget,
    TasksWidget,
    HabitTrackerWidget,
    FlashcardWidget,
    EmbedWidget,
} from '@/app/components/WidgetsV2';
import type { WidgetType } from '@/lib/types/widget.types';

export function renderWidgetByType(id: string, type: string, settings?: Record<string, unknown>) {
    const props = { id, settings };

    switch (type as WidgetType) {
        case 'clock': return <ClockWidget {...props} />;
        case 'worldtime': return <WorldTimeWidget {...props} />;
        case 'weather': return <WeatherWidget {...props} />;
        case 'gif': return <GifWidget {...props} />;
        case 'tasks': return <TasksWidget {...props} />;
        case 'timer': return <TimerWidget {...props} />;
        case 'notes': return <NotesWidget {...props} />;
        case 'quote': return <QuoteWidget {...props} />;
        case 'calendar': return <CalendarWidget {...props} />;
        case 'breathing': return <BreathingWidget {...props} />;
        case 'dictionary': return <DictionaryWidget {...props} />;
        case 'habit': return <HabitTrackerWidget {...props} />;
        case 'focus': return <DailyFocusWidget {...props} />;
        case 'calculator': return <CalculatorWidget {...props} />;
        case 'quicklinks': return <QuickLinksWidget {...props} />;
        case 'flashcard': return <FlashcardWidget {...props} />;
        case 'embed': return <EmbedWidget {...props} />;
        default: return null;
    }
}
