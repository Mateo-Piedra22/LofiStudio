/**
 * Statistics Types V2
 * Type definitions for productivity statistics and analytics
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Core Session Types
// ═══════════════════════════════════════════════════════════════════════════════

export type SessionMode = 'work' | 'break' | 'long_break';

export interface PomodoroSessionV2 {
    id: string;
    mode: SessionMode;
    duration: number; // in seconds
    plannedDuration: number;
    completedAt: number; // timestamp
    taskId?: string;
    taskTitle?: string;

    // Additional metadata
    interrupted?: boolean;
    notes?: string;
}

export type ActivityLogType = 'session_start' | 'session_end' | 'task_complete' | 'task_create' | 'goal_met' | 'note_added';

export interface ActivityLogEntry {
    id: string;
    type: ActivityLogType;
    timestamp: number;
    description: string;
    metadata?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Statistics Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface DailyStats {
    date: string; // YYYY-MM-DD
    workSessions: number;
    breakSessions: number;
    totalWorkTime: number; // seconds
    totalBreakTime: number;
    tasksCompleted: number;
}

export interface WeeklyStats {
    weekStart: string; // YYYY-MM-DD (Monday)
    dailyStats: DailyStats[];
    totalWorkSessions: number;
    totalWorkTime: number;
    averageSessionLength: number;
}

export interface StreakInfo {
    current: number;
    longest: number;
    lastActiveDate: string; // YYYY-MM-DD
}

export interface ProductivitySummary {
    totalSessions: number;
    totalWorkTime: number;
    totalBreakTime: number;
    averageSessionsPerDay: number;
    mostProductiveHour: number; // 0-23
    mostProductiveDay: string; // 'Monday', etc.
    streak: StreakInfo;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Chart Data Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ActivityChartData {
    label: string;
    workSessions: number;
    breakSessions: number;
    workTime: number;
}

export interface HeatmapCell {
    date: string;
    value: number;
    level: 0 | 1 | 2 | 3 | 4; // intensity level
}

export interface HourlyDistribution {
    hour: number;
    count: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface StatisticsState {
    sessions: PomodoroSessionV2[];
    activityLog: ActivityLogEntry[];
    isLoading: boolean;
}

export interface StatisticsActions {
    // Session management
    logSession: (session: Omit<PomodoroSessionV2, 'id' | 'completedAt'>) => void;
    deleteSession: (id: string) => void;
    clearAllSessions: () => void;

    // Activity Log
    logActivity: (type: ActivityLogType, description: string, metadata?: Record<string, any>) => void;
    getRecentActivity: (limit?: number) => ActivityLogEntry[];

    // Queries
    getSessionsByDateRange: (startDate: number, endDate: number) => PomodoroSessionV2[];
    getTodaySessions: () => PomodoroSessionV2[];
    getThisWeekSessions: () => PomodoroSessionV2[];

    // Statistics
    getSummary: () => ProductivitySummary;
    getDailyStats: (date: Date) => DailyStats;
    getWeeklyStats: (weekStart: Date) => WeeklyStats;
    getActivityChartData: (days: number) => ActivityChartData[];
    getHeatmapData: (weeks: number) => HeatmapCell[];
    getHourlyDistribution: () => HourlyDistribution[];

    // Streak
    getStreakInfo: () => StreakInfo;
}

export type StatisticsStore = StatisticsState & StatisticsActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

export function formatDurationShort(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h`;
    }
    return `${minutes}m`;
}

export function getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
