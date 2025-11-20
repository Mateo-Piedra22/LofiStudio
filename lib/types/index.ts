export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  duration?: number; // Duration in seconds if completed during a pomodoro
  tags?: string[];
  dueAt?: number;
  color?: string;
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

export interface WidgetConfig {
  id: string;
  type: 'clock' | 'weather' | 'gif' | 'tasks' | 'timer' | 'notes' | 'quote' | 'calendar' | 'breathing' | 'dictionary';
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  enabled: boolean;
  settings?: any;
}

export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  widgets: Omit<WidgetConfig, 'id'>[];
  background?: { type: 'room' | 'cafe' | 'gradient' | 'video'; videoId?: string };
  musicPlaylist?: { id: string; title: string; thumbnail: string }[];
}
