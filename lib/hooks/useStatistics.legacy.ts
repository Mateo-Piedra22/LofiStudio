'use client';

import { useLocalStorage } from './useLocalStorage';
import { PomodoroSession, Statistics } from '../types';

export function useStatistics() {
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('pomodoroSessions', []);

  const logSession = (mode: 'work' | 'break', duration: number, taskId?: string) => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      mode,
      duration,
      completedAt: Date.now(),
      taskId,
    };
    setSessions((prev: PomodoroSession[]) => [session, ...prev]);
  };

  const getStatistics = (): Statistics => {
    const workSessions = sessions.filter(s => s.mode === 'work');
    const totalWorkTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalBreakTime = sessions.filter(s => s.mode === 'break').reduce((acc, s) => acc + s.duration, 0);

    // Calculate current streak
    const today = new Date().setHours(0, 0, 0, 0);
    const sortedSessions = [...workSessions].sort((a, b) => b.completedAt - a.completedAt);
    
    let currentStreak = 0;
    let checkDate = today;
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt).setHours(0, 0, 0, 0);
      if (sessionDate === checkDate) {
        currentStreak++;
      } else if (sessionDate < checkDate - 86400000) {
        break;
      }
      checkDate = sessionDate - 86400000;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = 0;

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt).setHours(0, 0, 0, 0);
      if (lastDate === 0 || sessionDate === lastDate || sessionDate === lastDate - 86400000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      lastDate = sessionDate;
    }

    return {
      totalSessions: sessions.length,
      totalWorkTime,
      totalBreakTime,
      tasksCompleted: 0, // Will be updated from task manager
      currentStreak,
      longestStreak,
    };
  };

  const getSessionsByDateRange = (startDate: number, endDate: number) => {
    return sessions.filter(s => s.completedAt >= startDate && s.completedAt <= endDate);
  };

  return {
    sessions,
    logSession,
    getStatistics,
    getSessionsByDateRange,
  };
}
