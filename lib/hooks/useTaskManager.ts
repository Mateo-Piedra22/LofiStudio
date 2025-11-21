'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, TaskLog } from '../types';
import { useSession } from 'next-auth/react';

export function useTaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [taskLogs, setTaskLogs] = useLocalStorage<TaskLog[]>('taskLogs', []);
  const { data: session } = useSession();
  const [googleTasksEnabled] = useLocalStorage('googleTasksEnabled', true);
  const [googleCalendarEnabled] = useLocalStorage('googleCalendarEnabled', true);
  const [syncTaskToCalendarEnabled] = useLocalStorage('syncTaskToCalendarEnabled', true);
  const [googleTaskListId] = useLocalStorage('googleTaskListId', '');
  const [googleCalendarId] = useLocalStorage('googleCalendarId', 'primary');

  const addTask = useCallback((title: string, description?: string, options?: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      tags: options?.tags,
      dueAt: options?.dueAt,
      color: options?.color,
    };

    setTasks((prev: Task[]) => [newTask, ...prev]);

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: newTask.id,
      action: 'created',
      timestamp: Date.now(),
      details: `Task "${title}" created`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);

    (async () => {
      try {
        if (!googleTasksEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/tasks');
        if (!hasScope) return;
        const res = await fetch('/api/google/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId: googleTaskListId || undefined, title, notes: description, dueAt: options?.dueAt })
        });
        if (!res.ok) return;
        const data = await res.json();
        const externalId = data?.task?.id as string | undefined;
        if (externalId) {
          setTasks((prev: Task[]) => prev.map(t => t.id === newTask.id ? { ...t, externalSource: 'google', externalId } : t));
        }
      } catch {}
    })();

    (async () => {
      try {
        if (!syncTaskToCalendarEnabled || !googleCalendarEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
        if (!hasScope) return;
        const due = options?.dueAt;
        if (typeof due !== 'number') return;
        const start = new Date(due);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const res = await fetch('/api/google/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', summary: title, start: start.getTime(), end: end.getTime() }) });
        if (!res.ok) return;
        const data = await res.json();
        const evId = data?.event?.id as string | undefined;
        if (evId) {
          setTasks((prev: Task[]) => prev.map(t => t.id === newTask.id ? { ...t, externalCalendarId: evId } : t));
        }
      } catch {}
    })();

    return newTask;
  }, [setTasks, setTaskLogs]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev: Task[]) => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'updated',
      timestamp: Date.now(),
      details: `Task updated`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);

    (async () => {
      try {
        if (!googleTasksEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/tasks');
        if (!hasScope) return;
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        if (t.externalSource === 'google' && t.externalId) {
          await fetch('/api/google/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listId: googleTaskListId || undefined, id: t.externalId, title: updates.title, notes: updates.description, dueAt: typeof updates.dueAt === 'number' ? updates.dueAt : undefined, completed: typeof updates.completed === 'boolean' ? updates.completed : undefined })
          });
        } else {
          const res = await fetch('/api/google/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listId: googleTaskListId || undefined, title: updates.title || t.title, notes: updates.description ?? t.description, dueAt: typeof updates.dueAt === 'number' ? updates.dueAt : t.dueAt })
          });
          if (res.ok) {
            const data = await res.json();
            const externalId = data?.task?.id as string | undefined;
            if (externalId) {
              setTasks((prev: Task[]) => prev.map(x => x.id === id ? { ...x, externalSource: 'google', externalId } : x));
            }
          }
        }
      } catch {}
    })();

    (async () => {
      try {
        if (!syncTaskToCalendarEnabled || !googleCalendarEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
        if (!hasScope) return;
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        const due = typeof updates.dueAt === 'number' ? updates.dueAt : t.dueAt;
        if (typeof due !== 'number') return;
        const start = new Date(due);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        if (t.externalCalendarId) {
          await fetch('/api/google/calendar/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.externalCalendarId, summary: updates.title ?? t.title, start: start.getTime(), end: end.getTime() }) });
        } else {
          const res = await fetch('/api/google/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: updates.title ?? t.title, start: start.getTime(), end: end.getTime() }) });
          if (res.ok) {
            const data = await res.json();
            const evId = data?.event?.id as string | undefined;
            if (evId) {
              setTasks((prev: Task[]) => prev.map(x => x.id === id ? { ...x, externalCalendarId: evId } : x));
            }
          }
        }
      } catch {}
    })();
  }, [setTasks, setTaskLogs]);

  const completeTask = useCallback((id: string, duration?: number) => {
    setTasks((prev: Task[]) => 
      prev.map(task => 
        task.id === id 
          ? { ...task, completed: true, completedAt: Date.now(), duration } 
          : task
      )
    );

    const task = tasks.find(t => t.id === id);
    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'completed',
      timestamp: Date.now(),
      details: `Task "${task?.title}" completed${duration ? ` in ${Math.floor(duration / 60)} minutes` : ''}`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);

    (async () => {
      try {
        if (!googleTasksEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/tasks');
        if (!hasScope) return;
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        if (t.externalSource === 'google' && t.externalId) {
          await fetch('/api/google/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listId: googleTaskListId || undefined, id: t.externalId, completed: true }) });
        }
      } catch {}
    })();

    (async () => {
      try {
        if (!syncTaskToCalendarEnabled || !googleCalendarEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
        if (!hasScope) return;
        const t = tasks.find(x => x.id === id);
        if (!t?.externalCalendarId) return;
        const start = typeof t.dueAt === 'number' ? new Date(t.dueAt) : new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        await fetch('/api/google/calendar/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', id: t.externalCalendarId, summary: t.title, start: start.getTime(), end: end.getTime() }) });
      } catch {}
    })();
  }, [tasks, setTasks, setTaskLogs]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks((prev: Task[]) => prev.filter(task => task.id !== id));

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'deleted',
      timestamp: Date.now(),
      details: `Task "${task?.title}" deleted`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);

    (async () => {
      try {
        if (!googleTasksEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/tasks');
        if (!hasScope) return;
        const t = task;
        if (t?.externalSource === 'google' && t?.externalId) {
          await fetch('/api/google/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listId: googleTaskListId || undefined, id: t.externalId }) });
        }
      } catch {}
    })();

    (async () => {
      try {
        if (!syncTaskToCalendarEnabled || !googleCalendarEnabled) return;
        const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
        if (!hasScope) return;
        const t = task;
        if (!t?.externalCalendarId) return;
        await fetch('/api/google/calendar/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', id: t.externalCalendarId }) });
      } catch {}
    })();
  }, [tasks, setTasks, setTaskLogs]);

  const syncGoogleTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/google/tasks');
      if (!res.ok) return;
      const data = await res.json();
      const remote: any[] = data.tasks || [];
      setTasks((prev: Task[]) => {
        const byExt = new Map(prev.filter(t => t.externalSource === 'google' && t.externalId).map(t => [t.externalId as string, t]));
        const merged = [...prev];
        remote.forEach(rt => {
          const existing = byExt.get(rt.id);
          if (existing) {
            const idx = merged.findIndex(x => x.id === existing.id);
            if (idx >= 0) merged[idx] = {
              ...existing,
              title: rt.title || existing.title,
              description: rt.notes || existing.description,
              completed: !!rt.completed,
              dueAt: rt.dueAt || existing.dueAt,
            } as Task;
          } else {
            merged.push({
              id: crypto.randomUUID(),
              title: rt.title || 'Task',
              description: rt.notes || undefined,
              completed: !!rt.completed,
              createdAt: Date.now(),
              dueAt: rt.dueAt,
              color: '#3b82f6',
              tags: ['google'],
              externalSource: 'google',
              externalId: rt.id,
            } as Task);
          }
        });
        return merged;
      });
    } catch {}
  }, [setTasks]);

  useEffect(() => {
    if (!googleTasksEnabled) return;
    const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/tasks');
    if (!hasScope) return;
    syncGoogleTasks();
  }, [googleTasksEnabled, (session as any)?.accessToken]);

  const getTasksByStatus = useCallback((completed: boolean) => {
    return tasks.filter(task => task.completed === completed);
  }, [tasks]);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  return {
    tasks,
    taskLogs,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksByStatus,
    getTaskById,
    syncGoogleTasks,
  };
}
