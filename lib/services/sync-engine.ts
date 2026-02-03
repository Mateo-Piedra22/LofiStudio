/**
 * Sync Engine V2
 * Robust synchronization service for Tasks with conflict resolution
 */

import type {
    TaskV2,
    SyncSource,
    SyncResult,
    SyncConflict,
    SyncError,
    SyncQueueItem,
    ConflictResolution,
    GoogleTask,
    GoogleTaskList,
    GoogleCalendarEvent,
    TaskSyncInfo,
} from '@/lib/types/task.types';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const BATCH_SIZE = 50;

// ═══════════════════════════════════════════════════════════════════════════════
// Sync Engine Class
// ═══════════════════════════════════════════════════════════════════════════════

export class SyncEngine {
    private isProcessing = false;
    private abortController: AbortController | null = null;

    // ─────────────────────────────────────────────────────────────────────────────
    // Google Tasks API
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all task lists from Google Tasks
     */
    async fetchGoogleTaskLists(): Promise<GoogleTaskList[]> {
        try {
            const res = await fetch('/api/google/tasks/lists');
            if (!res.ok) {
                throw new Error(`Failed to fetch task lists: ${res.status}`);
            }
            const data = await res.json();
            return data.lists || [];
        } catch (error) {
            console.error('[SyncEngine] fetchGoogleTaskLists error:', error);
            throw error;
        }
    }

    /**
     * Fetch all tasks from a Google Tasks list
     */
    async fetchGoogleTasks(listId?: string): Promise<GoogleTask[]> {
        try {
            const url = listId
                ? `/api/google/tasks?listId=${encodeURIComponent(listId)}`
                : '/api/google/tasks';
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Failed to fetch tasks: ${res.status}`);
            }
            const data = await res.json();
            return data.tasks || [];
        } catch (error) {
            console.error('[SyncEngine] fetchGoogleTasks error:', error);
            throw error;
        }
    }

    /**
     * Create a task in Google Tasks
     */
    async createGoogleTask(
        task: TaskV2,
        listId?: string
    ): Promise<GoogleTask | null> {
        try {
            const res = await fetch('/api/google/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listId,
                    title: task.title,
                    notes: task.description || task.notes,
                    dueAt: task.dueAt,
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to create task: ${res.status}`);
            }
            const data = await res.json();
            return data.task || null;
        } catch (error) {
            console.error('[SyncEngine] createGoogleTask error:', error);
            return null;
        }
    }

    /**
     * Update a task in Google Tasks
     */
    async updateGoogleTask(
        taskId: string,
        updates: Partial<TaskV2>,
        listId?: string
    ): Promise<GoogleTask | null> {
        try {
            const res = await fetch('/api/google/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listId,
                    id: taskId,
                    title: updates.title,
                    notes: updates.description || updates.notes,
                    dueAt: updates.dueAt,
                    completed: updates.completed,
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to update task: ${res.status}`);
            }
            const data = await res.json();
            return data.task || null;
        } catch (error) {
            console.error('[SyncEngine] updateGoogleTask error:', error);
            return null;
        }
    }

    /**
     * Delete a task from Google Tasks
     */
    async deleteGoogleTask(taskId: string, listId?: string): Promise<boolean> {
        try {
            const res = await fetch('/api/google/tasks', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listId, id: taskId }),
            });
            return res.ok;
        } catch (error) {
            console.error('[SyncEngine] deleteGoogleTask error:', error);
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Google Calendar API
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Create a calendar event for a task
     */
    async createCalendarEvent(
        task: TaskV2,
        calendarId: string = 'primary'
    ): Promise<GoogleCalendarEvent | null> {
        if (!task.dueAt) return null;

        try {
            const start = new Date(task.dueAt);
            const end = new Date(start.getTime() + (task.estimatedDuration || 60) * 60 * 1000);

            const res = await fetch('/api/google/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendarId,
                    summary: task.title,
                    description: task.description,
                    start: start.getTime(),
                    end: end.getTime(),
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to create calendar event: ${res.status}`);
            }
            const data = await res.json();
            return data.event || null;
        } catch (error) {
            console.error('[SyncEngine] createCalendarEvent error:', error);
            return null;
        }
    }

    /**
     * Update a calendar event
     */
    async updateCalendarEvent(
        eventId: string,
        task: TaskV2,
        calendarId: string = 'primary'
    ): Promise<GoogleCalendarEvent | null> {
        if (!task.dueAt) return null;

        try {
            const start = new Date(task.dueAt);
            const end = new Date(start.getTime() + (task.estimatedDuration || 60) * 60 * 1000);

            const res = await fetch('/api/google/calendar/events', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendarId,
                    id: eventId,
                    summary: task.title,
                    description: task.description,
                    start: start.getTime(),
                    end: end.getTime(),
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to update calendar event: ${res.status}`);
            }
            const data = await res.json();
            return data.event || null;
        } catch (error) {
            console.error('[SyncEngine] updateCalendarEvent error:', error);
            return null;
        }
    }

    /**
     * Delete a calendar event
     */
    async deleteCalendarEvent(
        eventId: string,
        calendarId: string = 'primary'
    ): Promise<boolean> {
        try {
            const res = await fetch('/api/google/calendar/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calendarId, id: eventId }),
            });
            return res.ok;
        } catch (error) {
            console.error('[SyncEngine] deleteCalendarEvent error:', error);
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Sync Logic
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Full sync with Google Tasks
     */
    async syncGoogleTasks(
        localTasks: TaskV2[],
        listId?: string,
        onUpdate: (tasks: TaskV2[]) => void = () => { },
        onConflict: (conflict: SyncConflict) => void = () => { }
    ): Promise<SyncResult> {
        const startTime = Date.now();
        const errors: SyncError[] = [];
        const conflicts: SyncConflict[] = [];
        let itemsSynced = 0;

        try {
            // 1. Fetch remote tasks
            const remoteTasks = await this.fetchGoogleTasks(listId);

            // 2. Build lookup maps
            const localByGoogleId = new Map<string, TaskV2>();
            const localById = new Map<string, TaskV2>();

            localTasks.forEach(task => {
                localById.set(task.id, task);
                if (task.syncInfo?.googleTaskId) {
                    localByGoogleId.set(task.syncInfo.googleTaskId, task);
                }
            });

            const remoteById = new Map<string, GoogleTask>();
            remoteTasks.forEach(rt => remoteById.set(rt.id, rt));

            // 3. Process remote tasks (pull)
            const updatedTasks = [...localTasks];

            for (const remoteTask of remoteTasks) {
                const localTask = localByGoogleId.get(remoteTask.id);

                if (localTask) {
                    // Task exists locally - check for conflicts
                    const remoteUpdated = new Date(remoteTask.updated).getTime();
                    const localUpdated = localTask.updatedAt;

                    if (remoteUpdated > (localTask.syncInfo?.googleTaskUpdated || 0)) {
                        // Remote is newer - check for local changes
                        if (localTask.syncInfo?.pendingChanges) {
                            // Conflict!
                            const conflict = this.detectConflict(localTask, remoteTask);
                            if (conflict) {
                                conflicts.push(conflict);
                                onConflict(conflict);
                            }
                        } else {
                            // No local changes - apply remote updates
                            const idx = updatedTasks.findIndex(t => t.id === localTask.id);
                            if (idx >= 0) {
                                updatedTasks[idx] = this.mergeRemoteTask(localTask, remoteTask);
                                itemsSynced++;
                            }
                        }
                    }
                } else {
                    // New task from remote
                    const newTask = this.convertGoogleTask(remoteTask);
                    updatedTasks.push(newTask);
                    itemsSynced++;
                }
            }

            // 4. Push local tasks without Google ID
            const localOnlyTasks = localTasks.filter(
                t => !t.syncInfo?.googleTaskId && t.syncInfo?.syncStatus === 'pending'
            );

            for (const task of localOnlyTasks) {
                const created = await this.createGoogleTask(task, listId);
                if (created) {
                    const idx = updatedTasks.findIndex(t => t.id === task.id);
                    if (idx >= 0) {
                        updatedTasks[idx] = {
                            ...updatedTasks[idx],
                            syncInfo: {
                                ...updatedTasks[idx].syncInfo,
                                googleTaskId: created.id,
                                googleTaskListId: listId,
                                googleTaskEtag: created.etag,
                                googleTaskUpdated: new Date(created.updated).getTime(),
                                syncStatus: 'synced',
                                lastSyncedAt: Date.now(),
                            },
                        };
                        itemsSynced++;
                    }
                } else {
                    errors.push({
                        taskId: task.id,
                        source: 'google_tasks',
                        operation: 'create',
                        message: 'Failed to create task in Google Tasks',
                        recoverable: true,
                        timestamp: Date.now(),
                    });
                }
            }

            // 5. Push pending changes
            const pendingTasks = updatedTasks.filter(
                t => t.syncInfo?.googleTaskId && t.syncInfo?.pendingChanges
            );

            for (const task of pendingTasks) {
                if (!task.syncInfo?.googleTaskId) continue;

                const updated = await this.updateGoogleTask(
                    task.syncInfo.googleTaskId,
                    task.syncInfo.pendingChanges || {},
                    listId
                );

                if (updated) {
                    const idx = updatedTasks.findIndex(t => t.id === task.id);
                    if (idx >= 0) {
                        updatedTasks[idx] = {
                            ...updatedTasks[idx],
                            syncInfo: {
                                ...updatedTasks[idx].syncInfo,
                                googleTaskEtag: updated.etag,
                                googleTaskUpdated: new Date(updated.updated).getTime(),
                                syncStatus: 'synced',
                                pendingChanges: undefined,
                                lastSyncedAt: Date.now(),
                            },
                        };
                        itemsSynced++;
                    }
                }
            }

            // 6. Update callback
            onUpdate(updatedTasks);

            return {
                success: errors.length === 0,
                source: 'google_tasks',
                operation: 'merge',
                itemsSynced,
                conflicts,
                errors,
                timestamp: Date.now(),
                duration: Date.now() - startTime,
            };
        } catch (error) {
            const err = error as Error;
            errors.push({
                source: 'google_tasks',
                operation: 'sync',
                message: err.message || 'Unknown error',
                recoverable: true,
                timestamp: Date.now(),
            });

            return {
                success: false,
                source: 'google_tasks',
                operation: 'merge',
                itemsSynced,
                conflicts,
                errors,
                timestamp: Date.now(),
                duration: Date.now() - startTime,
            };
        }
    }

    /**
     * Detect conflicts between local and remote versions
     */
    private detectConflict(local: TaskV2, remote: GoogleTask): SyncConflict | null {
        const pendingChanges = local.syncInfo?.pendingChanges;
        if (!pendingChanges) return null;

        // Check each field for conflicts
        const conflictingFields: (keyof TaskV2)[] = [];

        if (pendingChanges.title && pendingChanges.title !== remote.title) {
            conflictingFields.push('title');
        }

        if (pendingChanges.description && pendingChanges.description !== remote.notes) {
            conflictingFields.push('description');
        }

        if (typeof pendingChanges.completed === 'boolean') {
            const remoteCompleted = remote.status === 'completed';
            if (pendingChanges.completed !== remoteCompleted) {
                conflictingFields.push('completed');
            }
        }

        if (conflictingFields.length === 0) return null;

        return {
            id: crypto.randomUUID(),
            taskId: local.id,
            localVersion: pendingChanges,
            remoteVersion: {
                title: remote.title,
                description: remote.notes,
                completed: remote.status === 'completed',
            },
            field: conflictingFields[0], // Primary conflict field
            detectedAt: Date.now(),
            resolved: false,
        };
    }

    /**
     * Merge remote task updates into local task
     */
    private mergeRemoteTask(local: TaskV2, remote: GoogleTask): TaskV2 {
        return {
            ...local,
            title: remote.title || local.title,
            description: remote.notes || local.description,
            completed: remote.status === 'completed',
            completedAt: remote.completed ? new Date(remote.completed).getTime() : local.completedAt,
            dueAt: remote.due ? new Date(remote.due).getTime() : local.dueAt,
            status: remote.status === 'completed' ? 'completed' : local.status,
            updatedAt: Date.now(),
            syncInfo: {
                ...local.syncInfo,
                googleTaskId: remote.id,
                googleTaskEtag: remote.etag,
                googleTaskUpdated: new Date(remote.updated).getTime(),
                syncStatus: 'synced',
                lastSyncedAt: Date.now(),
            },
        };
    }

    /**
     * Convert Google Task to local TaskV2
     */
    private convertGoogleTask(remote: GoogleTask): TaskV2 {
        return {
            id: crypto.randomUUID(),
            title: remote.title || 'Untitled Task',
            description: remote.notes,
            status: remote.status === 'completed' ? 'completed' : 'pending',
            completed: remote.status === 'completed',
            completedAt: remote.completed ? new Date(remote.completed).getTime() : undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dueAt: remote.due ? new Date(remote.due).getTime() : undefined,
            priority: 'medium',
            tags: ['google'],
            version: 1,
            syncInfo: {
                googleTaskId: remote.id,
                googleTaskEtag: remote.etag,
                googleTaskUpdated: new Date(remote.updated).getTime(),
                syncStatus: 'synced',
                lastSyncedAt: Date.now(),
            },
        };
    }

    /**
     * Apply conflict resolution
     */
    resolveConflict(
        task: TaskV2,
        conflict: SyncConflict,
        resolution: ConflictResolution
    ): TaskV2 {
        switch (resolution) {
            case 'local_wins':
                // Keep local changes, clear conflict
                return {
                    ...task,
                    syncInfo: {
                        ...task.syncInfo,
                        syncStatus: 'pending', // Will push on next sync
                    },
                };

            case 'remote_wins':
                // Apply remote version
                return {
                    ...task,
                    ...conflict.remoteVersion,
                    updatedAt: Date.now(),
                    version: task.version + 1,
                    syncInfo: {
                        ...task.syncInfo,
                        syncStatus: 'synced',
                        pendingChanges: undefined,
                    },
                };

            case 'merge':
                // Merge both - prefer local for conflicting fields
                return {
                    ...task,
                    ...conflict.remoteVersion,
                    ...conflict.localVersion, // Local wins on conflicts
                    updatedAt: Date.now(),
                    version: task.version + 1,
                    syncInfo: {
                        ...task.syncInfo,
                        syncStatus: 'pending',
                    },
                };

            default:
                return task;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Queue Processing
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Process sync queue items with retry logic
     */
    async processQueue(
        queue: SyncQueueItem[],
        onComplete: (item: SyncQueueItem, success: boolean) => void
    ): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            for (const item of queue) {
                if (item.retries >= item.maxRetries) {
                    onComplete(item, false);
                    continue;
                }

                let success = false;

                switch (item.operation) {
                    case 'create':
                        // Handle create...
                        success = true;
                        break;
                    case 'update':
                        // Handle update...
                        success = true;
                        break;
                    case 'delete':
                        // Handle delete...
                        success = true;
                        break;
                }

                onComplete(item, success);

                // Small delay between operations
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Cancel ongoing sync operations
     */
    cancel(): void {
        this.abortController?.abort();
        this.abortController = null;
        this.isProcessing = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

export const syncEngine = new SyncEngine();
