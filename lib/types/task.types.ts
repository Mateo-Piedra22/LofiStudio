/**
 * Task Types V2
 * Complete type definitions for the Tasks system with sync support
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Core Task Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Priority levels for tasks
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task status lifecycle
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * External sync sources
 */
export type SyncSource = 'google_tasks' | 'google_calendar';

/**
 * Sync status for individual items
 */
export type SyncStatus =
    | 'synced'        // In sync with remote
    | 'pending'       // Waiting to sync
    | 'syncing'       // Currently syncing
    | 'conflict'      // Conflict detected
    | 'error';        // Sync error

/**
 * Core Task interface (V2)
 */
export interface TaskV2 {
    // Identity
    id: string;

    // Content
    title: string;
    description?: string;
    notes?: string;

    // Status
    status: TaskStatus;
    completed: boolean;
    completedAt?: number;

    // Timing
    createdAt: number;
    updatedAt: number;
    dueAt?: number;
    startAt?: number;
    estimatedDuration?: number; // in minutes
    actualDuration?: number;    // in minutes

    // Organization
    priority: TaskPriority;
    tags: string[];
    color?: string;
    listId?: string;

    // Recurrence
    isRecurring?: boolean;
    recurrenceRule?: string; // RFC 5545 RRULE format

    // External sync tracking
    syncInfo?: TaskSyncInfo;

    // Metadata
    version: number; // For optimistic concurrency
}

/**
 * Sync tracking information for a task
 */
export interface TaskSyncInfo {
    // Google Tasks
    googleTaskId?: string;
    googleTaskListId?: string;
    googleTaskEtag?: string;
    googleTaskUpdated?: number;

    // Google Calendar (for due date events)
    googleCalendarEventId?: string;
    googleCalendarId?: string;
    googleCalendarEtag?: string;

    // Sync state
    lastSyncedAt?: number;
    syncStatus: SyncStatus;
    syncError?: string;
    pendingChanges?: Partial<TaskV2>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Task List Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Task list (similar to Google Tasks List)
 */
export interface TaskList {
    id: string;
    title: string;
    color?: string;
    isDefault?: boolean;

    // External sync
    googleTaskListId?: string;
    syncEnabled: boolean;
    lastSyncedAt?: number;

    createdAt: number;
    updatedAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Activity Log Types
// ═══════════════════════════════════════════════════════════════════════════════

export type TaskAction =
    | 'created'
    | 'updated'
    | 'completed'
    | 'reopened'
    | 'deleted'
    | 'synced'
    | 'conflict_resolved';

export interface TaskActivity {
    id: string;
    taskId: string;
    action: TaskAction;
    timestamp: number;
    details?: string;
    metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sync Engine Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sync operation types
 */
export type SyncOperationType =
    | 'push'    // Local -> Remote
    | 'pull'    // Remote -> Local
    | 'merge';  // Bidirectional

/**
 * Conflict resolution strategies
 */
export type ConflictResolution =
    | 'local_wins'   // Keep local version
    | 'remote_wins'  // Use remote version
    | 'merge'        // Merge changes
    | 'manual';      // Require user decision

/**
 * Sync conflict
 */
export interface SyncConflict {
    id: string;
    taskId: string;
    localVersion: Partial<TaskV2>;
    remoteVersion: Partial<TaskV2>;
    field: keyof TaskV2;
    detectedAt: number;
    resolved: boolean;
    resolution?: ConflictResolution;
}

/**
 * Sync operation result
 */
export interface SyncResult {
    success: boolean;
    source: SyncSource;
    operation: SyncOperationType;
    itemsSynced: number;
    conflicts: SyncConflict[];
    errors: SyncError[];
    timestamp: number;
    duration: number;
}

/**
 * Sync error
 */
export interface SyncError {
    taskId?: string;
    source: SyncSource;
    operation: string;
    message: string;
    code?: string;
    recoverable: boolean;
    timestamp: number;
}

/**
 * Sync queue item for pending operations
 */
export interface SyncQueueItem {
    id: string;
    taskId: string;
    operation: 'create' | 'update' | 'delete';
    target: SyncSource;
    payload: Partial<TaskV2>;
    retries: number;
    maxRetries: number;
    createdAt: number;
    lastAttempt?: number;
    error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// External API Types (Google Tasks / Calendar)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Google Tasks API response
 */
export interface GoogleTask {
    id: string;
    title: string;
    notes?: string;
    status: 'needsAction' | 'completed';
    due?: string; // RFC 3339 date string
    completed?: string;
    updated: string;
    etag: string;
    parent?: string;
    position?: string;
    links?: Array<{
        type: string;
        description: string;
        link: string;
    }>;
}

/**
 * Google Tasks List API response
 */
export interface GoogleTaskList {
    id: string;
    title: string;
    updated: string;
    etag: string;
}

/**
 * Google Calendar Event (subset for tasks)
 */
export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    status: 'confirmed' | 'tentative' | 'cancelled';
    etag: string;
    updated: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Filter options for task queries
 */
export interface TaskFilter {
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    listId?: string;
    tags?: string[];
    dueBefore?: number;
    dueAfter?: number;
    search?: string;
}

/**
 * Sort options for task queries
 */
export interface TaskSort {
    field: 'createdAt' | 'updatedAt' | 'dueAt' | 'priority' | 'title';
    direction: 'asc' | 'desc';
}

/**
 * State persisted to localStorage
 */
export interface TaskPersistedState {
    tasks: TaskV2[];
    taskLists: TaskList[];
    activities: TaskActivity[];
    syncQueue: SyncQueueItem[];
    lastSyncTimestamp: Record<SyncSource, number>;
}

/**
 * Complete Task Store State
 */
export interface TaskStoreState {
    // Data
    tasks: TaskV2[];
    taskLists: TaskList[];
    activities: TaskActivity[];

    // Sync
    syncQueue: SyncQueueItem[];
    syncConflicts: SyncConflict[];
    lastSyncTimestamp: Record<SyncSource, number>;
    isSyncing: boolean;
    syncError: string | null;

    // UI State
    activeListId: string | null;
    selectedTaskId: string | null;
    filter: TaskFilter;
    sort: TaskSort;
    isLoading: boolean;

    // Settings
    googleTasksEnabled: boolean;
    googleCalendarEnabled: boolean;
    syncTaskToCalendar: boolean;
    defaultListId: string | null;
    autoSync: boolean;
    syncInterval: number; // in minutes
}

/**
 * Task Store Actions
 */
export interface TaskStoreActions {
    // Initialization
    initialize: () => void;

    // Task CRUD
    addTask: (task: CreateTaskInput) => TaskV2;
    updateTask: (id: string, updates: Partial<TaskV2>) => void;
    deleteTask: (id: string) => void;
    completeTask: (id: string, duration?: number) => void;
    reopenTask: (id: string) => void;

    // Task queries
    getTask: (id: string) => TaskV2 | undefined;
    getTasks: (filter?: TaskFilter, sort?: TaskSort) => TaskV2[];
    getTasksByList: (listId: string) => TaskV2[];
    getPendingTasks: () => TaskV2[];
    getCompletedTasks: () => TaskV2[];
    getDueTodayTasks: () => TaskV2[];
    getOverdueTasks: () => TaskV2[];

    // Task lists
    addTaskList: (title: string, color?: string) => TaskList;
    updateTaskList: (id: string, updates: Partial<TaskList>) => void;
    deleteTaskList: (id: string) => void;
    setActiveList: (id: string | null) => void;

    // Sync operations
    syncAll: () => Promise<SyncResult[]>;
    syncGoogleTasks: () => Promise<SyncResult>;
    syncGoogleCalendar: () => Promise<SyncResult>;
    processSyncQueue: () => Promise<void>;
    resolveConflict: (conflictId: string, resolution: ConflictResolution) => void;
    clearSyncQueue: () => void;
    queueSyncOperation: (taskId: string, operation: 'create' | 'update' | 'delete', payload: Partial<TaskV2>) => void;

    // UI actions
    setFilter: (filter: TaskFilter) => void;
    setSort: (sort: TaskSort) => void;
    selectTask: (id: string | null) => void;

    // Settings
    setGoogleTasksEnabled: (enabled: boolean) => void;
    setGoogleCalendarEnabled: (enabled: boolean) => void;
    setSyncTaskToCalendar: (enabled: boolean) => void;
    setAutoSync: (enabled: boolean) => void;
    setSyncInterval: (minutes: number) => void;

    // Activity
    getRecentActivity: (limit?: number) => TaskActivity[];
    clearActivities: () => void;
}

/**
 * Complete Task Store
 */
export type TaskStore = TaskStoreState & TaskStoreActions;

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Task creation input
 */
export type CreateTaskInput = Pick<TaskV2, 'title'> & Partial<Omit<TaskV2, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'syncInfo'>>;

/**
 * Task update input
 */
export type UpdateTaskInput = Partial<Omit<TaskV2, 'id' | 'createdAt' | 'version' | 'syncInfo'>>;

// ═══════════════════════════════════════════════════════════════════════════════
// Type Guards
// ═══════════════════════════════════════════════════════════════════════════════

export function isTaskV2(obj: unknown): obj is TaskV2 {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'title' in obj &&
        'status' in obj &&
        'version' in obj
    );
}

export function hasSyncInfo(task: TaskV2): task is TaskV2 & { syncInfo: TaskSyncInfo } {
    return task.syncInfo !== undefined;
}

export function isGoogleSynced(task: TaskV2): boolean {
    return !!task.syncInfo?.googleTaskId;
}

export function hasCalendarEvent(task: TaskV2): boolean {
    return !!task.syncInfo?.googleCalendarEventId;
}

export function isPendingSync(task: TaskV2): boolean {
    return task.syncInfo?.syncStatus === 'pending';
}

export function hasConflict(task: TaskV2): boolean {
    return task.syncInfo?.syncStatus === 'conflict';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert legacy Task to TaskV2
 */
export function migrateTask(legacy: {
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
}): TaskV2 {
    return {
        id: legacy.id,
        title: legacy.title,
        description: legacy.description,
        status: legacy.completed ? 'completed' : 'pending',
        completed: legacy.completed,
        completedAt: legacy.completedAt,
        createdAt: legacy.createdAt,
        updatedAt: legacy.createdAt,
        dueAt: legacy.dueAt,
        actualDuration: legacy.duration,
        priority: 'medium',
        tags: legacy.tags || [],
        color: legacy.color,
        version: 1,
        syncInfo: legacy.externalId ? {
            googleTaskId: legacy.externalSource === 'google' ? legacy.externalId : undefined,
            googleCalendarEventId: legacy.externalCalendarId,
            syncStatus: 'synced',
        } : undefined,
    };
}

/**
 * Get priority weight for sorting
 */
export function getPriorityWeight(priority: TaskPriority): number {
    const weights: Record<TaskPriority, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
    };
    return weights[priority];
}

/**
 * Check if task is due today
 */
export function isDueToday(task: TaskV2): boolean {
    if (!task.dueAt) return false;
    const today = new Date();
    const due = new Date(task.dueAt);
    return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
    );
}

/**
 * Check if task is overdue
 */
export function isOverdue(task: TaskV2): boolean {
    if (!task.dueAt || task.completed) return false;
    return task.dueAt < Date.now();
}
