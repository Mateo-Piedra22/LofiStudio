/**
 * Type Definitions Index
 * Central export for all type definitions
 */

// Original types (keeping for backward compatibility during migration)
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  duration?: number;
  tags?: string[];
  dueAt?: number;
  color?: string;
  externalSource?: string;
  externalId?: string;
  externalCalendarId?: string;
}

export interface TaskLog {
  id: string;
  taskId: string;
  action: 'created' | 'completed' | 'updated' | 'deleted';
  timestamp: number;
  details?: string;
}

export interface PomodoroSession {
  id: string;
  mode: 'work' | 'break';
  duration: number;
  completedAt: number;
  taskId?: string;
}

export interface Statistics {
  totalSessions: number;
  totalWorkTime: number;
  totalBreakTime: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  volume: number;
  widgets: {
    weather: boolean;
    clock: boolean;
    gif: boolean;
    tasks: boolean;
    stats: boolean;
  };
  background: string;
}

// V2 Types - New Widget System
export * from './widget.types';
export * from './layout.types';
export * from './audio.types';

// Legacy type for backward compatibility during migration
// TODO: Remove after migration complete
export interface WidgetConfig {
  id: string;
  type: 'clock' | 'worldtime' | 'weather' | 'gif' | 'tasks' | 'timer' | 'notes' | 'quote' | 'calendar' | 'breathing' | 'dictionary' | 'habit' | 'focus' | 'calculator' | 'quicklinks' | 'flashcard' | 'embed' | 'SPACER';
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  enabled: boolean;
  settings?: Record<string, unknown>;
  size?: '1x1' | '2x1' | '1x2' | '2x2' | '1x3' | '3x1';
}

export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  widgets: Omit<WidgetConfig, 'id'>[];
  background?: { type: 'room' | 'cafe' | 'gradient' | 'video' | 'image'; videoId?: string };
  musicPlaylist?: { id: string; title: string; thumbnail: string }[];
}
