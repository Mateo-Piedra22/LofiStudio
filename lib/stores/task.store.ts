/**
 * Task Store V2
 * Zustand store for task management with persistence and sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react'; // Added for hook optimization
import { syncEngine } from '@/lib/services/sync-engine';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { useShallow } from 'zustand/react/shallow';
import { StateStorage } from 'zustand/middleware';
import type {
    TaskV2,
    TaskList,
    TaskActivity,
    TaskFilter,
    TaskSort,
    TaskStore,
    TaskStoreState,
    SyncQueueItem,
    SyncConflict,
    SyncSource,
    SyncResult,
    ConflictResolution,
    CreateTaskInput,
    UpdateTaskInput,
    getPriorityWeight,
    isDueToday,
    isOverdue,
} from '@/lib/types/task.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lofistudio-tasks-v2';
const MAX_ACTIVITIES = 500;
const MAX_QUEUE_SIZE = 100;
const DEFAULT_SYNC_INTERVAL = 5; // minutes

// ═══════════════════════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: TaskStoreState = {
    // Data
    tasks: [],
    taskLists: [],
    activities: [],

    // Sync
    syncQueue: [],
    syncConflicts: [],
    lastSyncTimestamp: {} as Record<SyncSource, number>,
    isSyncing: false,
    syncError: null,

    // UI State
    activeListId: null,
    selectedTaskId: null,
    filter: {},
    sort: { field: 'createdAt', direction: 'desc' },
    isLoading: false,

    // Settings
    googleTasksEnabled: false,
    googleCalendarEnabled: false,
    syncTaskToCalendar: false,
    defaultListId: null,
    autoSync: true,
    syncInterval: DEFAULT_SYNC_INTERVAL,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getPriorityWeightLocal(priority: TaskV2['priority']): number {
    const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
    return weights[priority];
}

function isDueTodayLocal(task: TaskV2): boolean {
    if (!task.dueAt) return false;
    const today = new Date();
    const due = new Date(task.dueAt);
    return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
    );
}

function isOverdueLocal(task: TaskV2): boolean {
    if (!task.dueAt || task.completed) return false;
    return task.dueAt < Date.now();
}

function applyFilter(tasks: TaskV2[], filter: TaskFilter): TaskV2[] {
    return tasks.filter(task => {
        // Status filter
        if (filter.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            if (!statuses.includes(task.status)) return false;
        }

        // Priority filter
        if (filter.priority) {
            const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
            if (!priorities.includes(task.priority)) return false;
        }

        // List filter
        if (filter.listId && task.listId !== filter.listId) return false;

        // Tags filter
        if (filter.tags && filter.tags.length > 0) {
            if (!filter.tags.some(tag => task.tags.includes(tag))) return false;
        }

        // Due date filters
        if (filter.dueBefore && task.dueAt && task.dueAt > filter.dueBefore) return false;
        if (filter.dueAfter && task.dueAt && task.dueAt < filter.dueAfter) return false;

        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(searchLower);
            const descMatch = task.description?.toLowerCase().includes(searchLower);
            if (!titleMatch && !descMatch) return false;
        }

        return true;
    });
}

function applySort(tasks: TaskV2[], sort: TaskSort): TaskV2[] {
    return [...tasks].sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
            case 'createdAt':
                comparison = a.createdAt - b.createdAt;
                break;
            case 'updatedAt':
                comparison = a.updatedAt - b.updatedAt;
                break;
            case 'dueAt':
                if (!a.dueAt && !b.dueAt) comparison = 0;
                else if (!a.dueAt) comparison = 1;
                else if (!b.dueAt) comparison = -1;
                else comparison = a.dueAt - b.dueAt;
                break;
            case 'priority':
                comparison = getPriorityWeightLocal(b.priority) - getPriorityWeightLocal(a.priority);
                break;
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
        }

        return sort.direction === 'desc' ? -comparison : comparison;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ─────────────────────────────────────────────────────────────────────────
            // Initialization
            // ─────────────────────────────────────────────────────────────────────────

            initialize: () => {
                const state = get();

                // Create default list if none exists
                if (state.taskLists.length === 0) {
                    const defaultList: TaskList = {
                        id: crypto.randomUUID(),
                        title: 'My Tasks',
                        isDefault: true,
                        syncEnabled: true,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    };
                    set({
                        taskLists: [defaultList],
                        defaultListId: defaultList.id,
                        activeListId: defaultList.id,
                    });
                }

                // Trigger auto-sync if enabled
                if (state.autoSync && state.googleTasksEnabled) {
                    get().syncGoogleTasks();
                }
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Task CRUD
            // ─────────────────────────────────────────────────────────────────────────

            addTask: (input) => {
                const state = get();
                const now = Date.now();

                const newTask: TaskV2 = {
                    id: crypto.randomUUID(),
                    title: input.title,
                    description: input.description,
                    notes: input.notes,
                    status: input.status || 'pending',
                    completed: input.completed || false,
                    createdAt: now,
                    updatedAt: now,
                    dueAt: input.dueAt,
                    startAt: input.startAt,
                    estimatedDuration: input.estimatedDuration,
                    priority: input.priority || 'medium',
                    tags: input.tags || [],
                    color: input.color,
                    listId: input.listId || state.defaultListId || undefined,
                    version: 1,
                    syncInfo: state.googleTasksEnabled ? {
                        syncStatus: 'pending',
                    } : undefined,
                };

                // Add activity log
                const activity: TaskActivity = {
                    id: crypto.randomUUID(),
                    taskId: newTask.id,
                    action: 'created',
                    timestamp: now,
                    details: `Task "${newTask.title}" created`,
                };

                set(prev => ({
                    tasks: [newTask, ...prev.tasks],
                    activities: [activity, ...prev.activities].slice(0, MAX_ACTIVITIES),
                }));

                // Queue for sync if enabled
                if (state.googleTasksEnabled) {
                    get().queueSyncOperation(newTask.id, 'create', newTask);
                }

                // Log to global stats
                useStatisticsStore.getState().logActivity('task_create', `Created task "${newTask.title}"`, { taskId: newTask.id });

                return newTask;
            },

            updateTask: (id, updates) => {
                const state = get();
                const task = state.tasks.find(t => t.id === id);
                if (!task) return;

                const now = Date.now();

                set(prev => ({
                    tasks: prev.tasks.map(t => {
                        if (t.id !== id) return t;

                        const updated: TaskV2 = {
                            ...t,
                            ...updates,
                            updatedAt: now,
                            version: t.version + 1,
                            syncInfo: t.syncInfo ? {
                                ...t.syncInfo,
                                syncStatus: 'pending',
                                pendingChanges: { ...t.syncInfo.pendingChanges, ...updates },
                            } : undefined,
                        };

                        return updated;
                    }),
                    activities: [
                        {
                            id: crypto.randomUUID(),
                            taskId: id,
                            action: 'updated' as const,
                            timestamp: now,
                            details: `Task "${updates.title || task.title}" updated`,
                        },
                        ...prev.activities,
                    ].slice(0, MAX_ACTIVITIES),
                }));

                // Queue for sync
                if (state.googleTasksEnabled && task.syncInfo?.googleTaskId) {
                    get().queueSyncOperation(id, 'update', updates);
                }
            },

            deleteTask: (id) => {
                const state = get();
                const task = state.tasks.find(t => t.id === id);
                if (!task) return;

                const now = Date.now();

                set(prev => ({
                    tasks: prev.tasks.filter(t => t.id !== id),
                    activities: [
                        {
                            id: crypto.randomUUID(),
                            taskId: id,
                            action: 'deleted' as const,
                            timestamp: now,
                            details: `Task "${task.title}" deleted`,
                        },
                        ...prev.activities,
                    ].slice(0, MAX_ACTIVITIES),
                }));

                // Queue for sync
                if (state.googleTasksEnabled && task.syncInfo?.googleTaskId) {
                    get().queueSyncOperation(id, 'delete', { id });
                }
            },

            completeTask: (id, duration) => {
                const state = get();
                const task = state.tasks.find(t => t.id === id);
                if (!task) return;

                const now = Date.now();

                set(prev => ({
                    tasks: prev.tasks.map(t => {
                        if (t.id !== id) return t;
                        return {
                            ...t,
                            status: 'completed' as const,
                            completed: true,
                            completedAt: now,
                            actualDuration: duration,
                            updatedAt: now,
                            version: t.version + 1,
                            syncInfo: t.syncInfo ? {
                                ...t.syncInfo,
                                syncStatus: 'pending',
                                pendingChanges: { completed: true },
                            } : undefined,
                        };
                    }),
                    activities: [
                        {
                            id: crypto.randomUUID(),
                            taskId: id,
                            action: 'completed' as const,
                            timestamp: now,
                            details: `Task "${task.title}" completed${duration ? ` in ${Math.floor(duration / 60)} minutes` : ''}`,
                        },
                        ...prev.activities,
                    ].slice(0, MAX_ACTIVITIES),
                }));

                // Queue for sync
                if (state.googleTasksEnabled && task.syncInfo?.googleTaskId) {
                    get().queueSyncOperation(id, 'update', { completed: true });
                }

                // Log to global stats
                useStatisticsStore.getState().logActivity('task_complete', `Completed task "${task.title}"`, { taskId: id });
            },

            reopenTask: (id) => {
                const state = get();
                const task = state.tasks.find(t => t.id === id);
                if (!task) return;

                const now = Date.now();

                set(prev => ({
                    tasks: prev.tasks.map(t => {
                        if (t.id !== id) return t;
                        return {
                            ...t,
                            status: 'pending' as const,
                            completed: false,
                            completedAt: undefined,
                            updatedAt: now,
                            version: t.version + 1,
                            syncInfo: t.syncInfo ? {
                                ...t.syncInfo,
                                syncStatus: 'pending',
                                pendingChanges: { completed: false },
                            } : undefined,
                        };
                    }),
                    activities: [
                        {
                            id: crypto.randomUUID(),
                            taskId: id,
                            action: 'reopened' as const,
                            timestamp: now,
                            details: `Task "${task.title}" reopened`,
                        },
                        ...prev.activities,
                    ].slice(0, MAX_ACTIVITIES),
                }));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Task Queries
            // ─────────────────────────────────────────────────────────────────────────

            getTask: (id) => {
                return get().tasks.find(t => t.id === id);
            },

            getTasks: (filter, sort) => {
                const state = get();
                const effectiveFilter = filter || state.filter;
                const effectiveSort = sort || state.sort;

                let result = state.tasks;
                result = applyFilter(result, effectiveFilter);
                result = applySort(result, effectiveSort);

                return result;
            },

            getTasksByList: (listId) => {
                return get().tasks.filter(t => t.listId === listId);
            },

            getPendingTasks: () => {
                return get().tasks.filter(t => !t.completed);
            },

            getCompletedTasks: () => {
                return get().tasks.filter(t => t.completed);
            },

            getDueTodayTasks: () => {
                return get().tasks.filter(t => !t.completed && isDueTodayLocal(t));
            },

            getOverdueTasks: () => {
                return get().tasks.filter(t => isOverdueLocal(t));
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Task Lists
            // ─────────────────────────────────────────────────────────────────────────

            addTaskList: (title, color) => {
                const now = Date.now();
                const newList: TaskList = {
                    id: crypto.randomUUID(),
                    title,
                    color,
                    syncEnabled: true,
                    createdAt: now,
                    updatedAt: now,
                };

                set(prev => ({
                    taskLists: [...prev.taskLists, newList],
                }));

                return newList;
            },

            updateTaskList: (id, updates) => {
                set(prev => ({
                    taskLists: prev.taskLists.map(l =>
                        l.id === id
                            ? { ...l, ...updates, updatedAt: Date.now() }
                            : l
                    ),
                }));
            },

            deleteTaskList: (id) => {
                const state = get();
                if (state.taskLists.find(l => l.id === id)?.isDefault) {
                    return; // Cannot delete default list
                }

                set(prev => ({
                    taskLists: prev.taskLists.filter(l => l.id !== id),
                    tasks: prev.tasks.map(t =>
                        t.listId === id
                            ? { ...t, listId: prev.defaultListId || undefined }
                            : t
                    ),
                    activeListId: prev.activeListId === id ? prev.defaultListId : prev.activeListId,
                }));
            },

            setActiveList: (id) => {
                set({ activeListId: id });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Sync Operations
            // ─────────────────────────────────────────────────────────────────────────

            queueSyncOperation: (taskId: string, operation: 'create' | 'update' | 'delete', payload: Partial<TaskV2>) => {
                set(prev => {
                    // Remove existing operation for same task
                    const filtered = prev.syncQueue.filter(q => q.taskId !== taskId);

                    const item: SyncQueueItem = {
                        id: crypto.randomUUID(),
                        taskId,
                        operation,
                        target: 'google_tasks',
                        payload,
                        retries: 0,
                        maxRetries: 3,
                        createdAt: Date.now(),
                    };

                    return {
                        syncQueue: [...filtered, item].slice(-MAX_QUEUE_SIZE),
                    };
                });
            },

            syncAll: async () => {
                const state = get();
                const results: SyncResult[] = [];

                if (state.googleTasksEnabled) {
                    const result = await get().syncGoogleTasks();
                    results.push(result);
                }

                if (state.googleCalendarEnabled && state.syncTaskToCalendar) {
                    const result = await get().syncGoogleCalendar();
                    results.push(result);
                }

                return results;
            },

            syncGoogleTasks: async () => {
                const state = get();
                if (state.isSyncing) {
                    return {
                        success: false,
                        source: 'google_tasks' as SyncSource,
                        operation: 'merge' as const,
                        itemsSynced: 0,
                        conflicts: [],
                        errors: [{ source: 'google_tasks' as SyncSource, operation: 'sync', message: 'Sync already in progress', recoverable: true, timestamp: Date.now() }],
                        timestamp: Date.now(),
                        duration: 0,
                    };
                }

                set({ isSyncing: true, syncError: null });

                try {
                    const result = await syncEngine.syncGoogleTasks(
                        state.tasks,
                        undefined, // TODO: Use active list ID
                        (updatedTasks) => {
                            set({ tasks: updatedTasks });
                        },
                        (conflict) => {
                            set(prev => ({
                                syncConflicts: [...prev.syncConflicts, conflict],
                            }));
                        }
                    );

                    set({
                        isSyncing: false,
                        lastSyncTimestamp: {
                            ...state.lastSyncTimestamp,
                            google_tasks: Date.now(),
                        },
                    });

                    return result;
                } catch (error) {
                    const err = error as Error;
                    set({
                        isSyncing: false,
                        syncError: err.message
                    });

                    return {
                        success: false,
                        source: 'google_tasks' as SyncSource,
                        operation: 'merge' as const,
                        itemsSynced: 0,
                        conflicts: [],
                        errors: [{ source: 'google_tasks' as SyncSource, operation: 'sync', message: err.message, recoverable: true, timestamp: Date.now() }],
                        timestamp: Date.now(),
                        duration: 0,
                    };
                }
            },

            syncGoogleCalendar: async () => {
                // Placeholder for calendar sync
                return {
                    success: true,
                    source: 'google_calendar' as SyncSource,
                    operation: 'merge' as const,
                    itemsSynced: 0,
                    conflicts: [],
                    errors: [],
                    timestamp: Date.now(),
                    duration: 0,
                };
            },

            processSyncQueue: async () => {
                const state = get();
                if (state.syncQueue.length === 0) return;

                await syncEngine.processQueue(
                    state.syncQueue,
                    (item, success) => {
                        set(prev => ({
                            syncQueue: prev.syncQueue.filter(q => q.id !== item.id),
                        }));
                    }
                );
            },

            resolveConflict: (conflictId, resolution) => {
                const state = get();
                const conflict = state.syncConflicts.find(c => c.id === conflictId);
                if (!conflict) return;

                const task = state.tasks.find(t => t.id === conflict.taskId);
                if (!task) return;

                const resolved = syncEngine.resolveConflict(task, conflict, resolution);

                set(prev => ({
                    tasks: prev.tasks.map(t => t.id === resolved.id ? resolved : t),
                    syncConflicts: prev.syncConflicts.map(c =>
                        c.id === conflictId
                            ? { ...c, resolved: true, resolution }
                            : c
                    ),
                }));
            },

            clearSyncQueue: () => {
                set({ syncQueue: [] });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // UI Actions
            // ─────────────────────────────────────────────────────────────────────────

            setFilter: (filter) => {
                set({ filter });
            },

            setSort: (sort) => {
                set({ sort });
            },

            selectTask: (id) => {
                set({ selectedTaskId: id });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Settings
            // ─────────────────────────────────────────────────────────────────────────

            setGoogleTasksEnabled: (enabled) => {
                set({ googleTasksEnabled: enabled });
                if (enabled) {
                    get().syncGoogleTasks();
                }
            },

            setGoogleCalendarEnabled: (enabled) => {
                set({ googleCalendarEnabled: enabled });
            },

            setSyncTaskToCalendar: (enabled) => {
                set({ syncTaskToCalendar: enabled });
            },

            setAutoSync: (enabled) => {
                set({ autoSync: enabled });
            },

            setSyncInterval: (minutes) => {
                set({ syncInterval: minutes });
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Activity
            // ─────────────────────────────────────────────────────────────────────────

            getRecentActivity: (limit = 50) => {
                return get().activities.slice(0, limit);
            },

            clearActivities: () => {
                set({ activities: [] });
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
                tasks: state.tasks,
                taskLists: state.taskLists,
                activities: state.activities.slice(0, 100), // Keep only recent
                syncQueue: state.syncQueue,
                lastSyncTimestamp: state.lastSyncTimestamp,
                googleTasksEnabled: state.googleTasksEnabled,
                googleCalendarEnabled: state.googleCalendarEnabled,
                syncTaskToCalendar: state.syncTaskToCalendar,
                defaultListId: state.defaultListId,
                autoSync: state.autoSync,
                syncInterval: state.syncInterval,
            }),
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Hooks for specific selectors
// ═══════════════════════════════════════════════════════════════════════════════

export function useTask(id: string): TaskV2 | undefined {
    return useTaskStore(state => state.tasks.find(t => t.id === id));
}

export function useTasks(filter?: TaskFilter): TaskV2[] {
    const tasks = useTaskStore(state => state.tasks);
    const sort = useTaskStore(state => state.sort);

    return useMemo(() => {
        let result = tasks;
        if (filter) {
            result = applyFilter(result, filter);
        }
        return applySort(result, sort);
    }, [tasks, sort, filter ? JSON.stringify(filter) : null]);
}

export function usePendingTasks(): TaskV2[] {
    return useTaskStore(state => state.tasks.filter(t => !t.completed));
}

export function useCompletedTasks(): TaskV2[] {
    return useTaskStore(state => state.tasks.filter(t => t.completed));
}

export function useTaskLists(): TaskList[] {
    return useTaskStore(state => state.taskLists);
}

export function useSyncStatus() {
    return useTaskStore(useShallow(state => ({
        isSyncing: state.isSyncing,
        syncError: state.syncError,
        lastSync: state.lastSyncTimestamp,
        pendingCount: state.syncQueue.length,
        conflictCount: state.syncConflicts.filter(c => !c.resolved).length,
    })));
}
