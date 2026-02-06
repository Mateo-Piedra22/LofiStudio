/**
 * Statistics Store V2
 * Zustand store for productivity statistics
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
    StatisticsStore,
    StatisticsState,
    PomodoroSessionV2,
    ProductivitySummary,
    DailyStats,
    WeeklyStats,
    ActivityChartData,
    HeatmapCell,
    HourlyDistribution,
    StreakInfo,
    ActivityLogEntry,
    ActivityLogType,
} from '@/lib/types/statistics.types';
import { getDateString, getWeekStart, getDayName, formatDurationShort } from '@/lib/types/statistics.types';
import { StateStorage } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-statistics-v2';
const MAX_SESSIONS = 1000;

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: StatisticsState = {
    sessions: [],
    activityLog: [],
    isLoading: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getTodayStart(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
}

function getThisWeekStart(): Date {
    return getWeekStart(new Date());
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useStatisticsStore = create<StatisticsStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────────
            // Session Management
            // ─────────────────────────────────────────────────────────────────────────

            logSession: (sessionData) => {
                const session: PomodoroSessionV2 = {
                    ...sessionData,
                    id: crypto.randomUUID(),
                    completedAt: Date.now(),
                };

                const description = `Completed ${formatDurationShort(session.duration)} ${session.mode} session`;

                set(prev => {
                    const newLog: ActivityLogEntry = {
                        id: crypto.randomUUID(),
                        type: 'session_end',
                        timestamp: Date.now(),
                        description,
                        metadata: { sessionId: session.id, mode: session.mode }
                    };

                    return {
                        sessions: [session, ...prev.sessions].slice(0, MAX_SESSIONS),
                        activityLog: [newLog, ...prev.activityLog].slice(0, MAX_SESSIONS),
                    };
                });
            },

            deleteSession: (id: string) => {
                set(prev => ({
                    sessions: prev.sessions.filter(s => s.id !== id),
                }));
            },

            clearAllSessions: () => {
                set({ sessions: [], activityLog: [] });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Activity Log
            // ─────────────────────────────────────────────────────────────────────────

            logActivity: (type, description, metadata) => {
                const entry: ActivityLogEntry = {
                    id: crypto.randomUUID(),
                    type,
                    description,
                    timestamp: Date.now(),
                    metadata,
                };
                set(prev => ({
                    activityLog: [entry, ...prev.activityLog].slice(0, MAX_SESSIONS),
                }));
            },

            getRecentActivity: (limit = 50) => {
                return get().activityLog.slice(0, limit);
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Queries
            // ─────────────────────────────────────────────────────────────────────────

            getSessionsByDateRange: (startDate: number, endDate: number) => {
                const sessions = get().sessions;
                return sessions.filter(s =>
                    s.completedAt >= startDate && s.completedAt <= endDate
                );
            },

            getTodaySessions: () => {
                const todayStart = getTodayStart();
                return get().sessions.filter(s => s.completedAt >= todayStart);
            },

            getThisWeekSessions: () => {
                const weekStart = getThisWeekStart().getTime();
                return get().sessions.filter(s => s.completedAt >= weekStart);
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Statistics
            // ─────────────────────────────────────────────────────────────────────────

            getSummary: (): ProductivitySummary => {
                const sessions = get().sessions;
                const workSessions = sessions.filter(s => s.mode === 'work');

                const totalWorkTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
                const totalBreakTime = sessions
                    .filter(s => s.mode !== 'work')
                    .reduce((acc, s) => acc + s.duration, 0);

                // Calculate sessions per day
                const uniqueDays = new Set(sessions.map(s => getDateString(new Date(s.completedAt))));
                const averageSessionsPerDay = uniqueDays.size > 0
                    ? workSessions.length / uniqueDays.size
                    : 0;

                // Most productive hour
                const hourCounts = new Array(24).fill(0);
                workSessions.forEach(s => {
                    const hour = new Date(s.completedAt).getHours();
                    hourCounts[hour]++;
                });
                const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts));

                // Most productive day
                const dayCounts: Record<string, number> = {};
                workSessions.forEach(s => {
                    const day = getDayName(new Date(s.completedAt));
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                });
                const mostProductiveDay = Object.entries(dayCounts)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Monday';

                return {
                    totalSessions: sessions.length,
                    totalWorkTime,
                    totalBreakTime,
                    averageSessionsPerDay: Math.round(averageSessionsPerDay * 10) / 10,
                    mostProductiveHour,
                    mostProductiveDay,
                    streak: get().getStreakInfo(),
                };
            },

            getDailyStats: (date: Date): DailyStats => {
                const dateStr = getDateString(date);
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);

                const daySessions = get().getSessionsByDateRange(dayStart.getTime(), dayEnd.getTime());
                const workSessions = daySessions.filter(s => s.mode === 'work');
                const breakSessions = daySessions.filter(s => s.mode !== 'work');

                // Calculate tasks completed from Activity Log
                const startMs = dayStart.getTime();
                const endMs = dayEnd.getTime();
                const tasksCompleted = get().activityLog.filter(log =>
                    log.type === 'task_complete' &&
                    log.timestamp >= startMs &&
                    log.timestamp <= endMs
                ).length;

                return {
                    date: dateStr,
                    workSessions: workSessions.length,
                    breakSessions: breakSessions.length,
                    totalWorkTime: workSessions.reduce((acc, s) => acc + s.duration, 0),
                    totalBreakTime: breakSessions.reduce((acc, s) => acc + s.duration, 0),
                    tasksCompleted,
                };
            },

            getWeeklyStats: (weekStart: Date): WeeklyStats => {
                const dailyStats: DailyStats[] = [];
                const current = new Date(weekStart);

                for (let i = 0; i < 7; i++) {
                    dailyStats.push(get().getDailyStats(current));
                    current.setDate(current.getDate() + 1);
                }

                const totalWorkSessions = dailyStats.reduce((acc, d) => acc + d.workSessions, 0);
                const totalWorkTime = dailyStats.reduce((acc, d) => acc + d.totalWorkTime, 0);

                return {
                    weekStart: getDateString(weekStart),
                    dailyStats,
                    totalWorkSessions,
                    totalWorkTime,
                    averageSessionLength: totalWorkSessions > 0
                        ? Math.round(totalWorkTime / totalWorkSessions)
                        : 0,
                };
            },

            getActivityChartData: (days: number): ActivityChartData[] => {
                const data: ActivityChartData[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const stats = get().getDailyStats(date);

                    data.push({
                        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        workSessions: stats.workSessions,
                        breakSessions: stats.breakSessions,
                        workTime: stats.totalWorkTime,
                    });
                }

                return data;
            },

            getHeatmapData: (weeks: number): HeatmapCell[] => {
                const cells: HeatmapCell[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysToShow = weeks * 7;

                for (let i = daysToShow - 1; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const stats = get().getDailyStats(date);

                    // Determine intensity level based on work sessions
                    let level: 0 | 1 | 2 | 3 | 4 = 0;
                    if (stats.workSessions >= 8) level = 4;
                    else if (stats.workSessions >= 6) level = 3;
                    else if (stats.workSessions >= 4) level = 2;
                    else if (stats.workSessions >= 1) level = 1;

                    cells.push({
                        date: getDateString(date),
                        value: stats.workSessions,
                        level,
                    });
                }

                return cells;
            },

            getHourlyDistribution: (): HourlyDistribution[] => {
                const distribution: HourlyDistribution[] = [];
                const sessions = get().sessions.filter(s => s.mode === 'work');

                for (let hour = 0; hour < 24; hour++) {
                    const count = sessions.filter(s =>
                        new Date(s.completedAt).getHours() === hour
                    ).length;
                    distribution.push({ hour, count });
                }

                return distribution;
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Streak
            // ─────────────────────────────────────────────────────────────────────────

            getStreakInfo: (): StreakInfo => {
                const sessions = get().sessions.filter(s => s.mode === 'work');
                if (sessions.length === 0) {
                    return { current: 0, longest: 0, lastActiveDate: '' };
                }

                // Get unique dates with sessions
                const uniqueDates = [...new Set(
                    sessions.map(s => getDateString(new Date(s.completedAt)))
                )].sort().reverse();

                if (uniqueDates.length === 0) {
                    return { current: 0, longest: 0, lastActiveDate: '' };
                }

                const lastActiveDate = uniqueDates[0];
                const today = getDateString(new Date());
                const yesterday = getDateString(new Date(Date.now() - 86400000));

                // Calculate current streak
                let current = 0;
                let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday
                    ? new Date(uniqueDates[0])
                    : null;

                if (checkDate) {
                    for (const dateStr of uniqueDates) {
                        if (getDateString(checkDate) === dateStr) {
                            current++;
                            checkDate.setDate(checkDate.getDate() - 1);
                        } else {
                            break;
                        }
                    }
                }

                // Calculate longest streak
                let longest = 0;
                let tempStreak = 1;

                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const current = new Date(uniqueDates[i]);
                    const next = new Date(uniqueDates[i + 1]);
                    const diffDays = Math.round((current.getTime() - next.getTime()) / 86400000);

                    if (diffDays === 1) {
                        tempStreak++;
                        longest = Math.max(longest, tempStreak);
                    } else {
                        tempStreak = 1;
                    }
                }

                longest = Math.max(longest, tempStreak);

                return { current, longest, lastActiveDate };
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    const dummyStorage: StateStorage = {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                    return dummyStorage;
                }
                return localStorage;
            }),
            skipHydration: true,
            partialize: (state) => ({
                sessions: state.sessions,
                activityLog: state.activityLog,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useTodaySessionCount(): number {
    return useStatisticsStore(state => state.getTodaySessions().filter(s => s.mode === 'work').length);
}

export function useProductivitySummary(): ProductivitySummary {
    return useStatisticsStore(useShallow(state => state.getSummary()));
}

export function useStreak(): StreakInfo {
    return useStatisticsStore(useShallow(state => state.getStreakInfo()));
}

export function useRecentActivity(limit?: number): ActivityLogEntry[] {
    return useStatisticsStore(useShallow(state => state.getRecentActivity(limit)));
}
