/**
 * TaskList Component
 * Main task list with filtering and grouping
 */

'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Cloud, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaskStore, useSyncStatus } from '@/lib/stores/task.store';
import { TaskItem } from './TaskItem';
import { TaskForm, TaskFormData } from './TaskForm';
import { TaskFilters } from './TaskFilters';
import type { TaskV2, TaskFilter } from '@/lib/types/task.types';
import { cn } from '@/lib/utils';

interface TaskListProps {
    className?: string;
    compact?: boolean;
    showFilters?: boolean;
    showSearch?: boolean;
    showSyncStatus?: boolean;
    maxHeight?: string;
}

export function TaskList({
    className,
    compact = false,
    showFilters = true,
    showSearch = true,
    showSyncStatus = true,
    maxHeight = '500px',
}: TaskListProps) {
    const tasks = useTaskStore(s => s.tasks);
    const filter = useTaskStore(s => s.filter);
    const sort = useTaskStore(s => s.sort);

    const addTask = useTaskStore(s => s.addTask);
    const updateTask = useTaskStore(s => s.updateTask);
    const deleteTask = useTaskStore(s => s.deleteTask);
    const completeTask = useTaskStore(s => s.completeTask);
    const reopenTask = useTaskStore(s => s.reopenTask);
    const setFilter = useTaskStore(s => s.setFilter);
    const syncGoogleTasks = useTaskStore(s => s.syncGoogleTasks);
    const googleTasksEnabled = useTaskStore(s => s.googleTasksEnabled);

    const { isSyncing, pendingCount, conflictCount } = useSyncStatus();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskV2 | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    // Apply search and filters
    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (filter.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            result = result.filter(t => statuses.includes(t.status));
        }

        // Apply priority filter
        if (filter.priority) {
            const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
            result = result.filter(t => priorities.includes(t.priority));
        }

        // Sort
        result.sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // Then by sort preference
            let comparison = 0;
            switch (sort.field) {
                case 'createdAt':
                    comparison = a.createdAt - b.createdAt;
                    break;
                case 'dueAt':
                    if (!a.dueAt && !b.dueAt) comparison = 0;
                    else if (!a.dueAt) comparison = 1;
                    else if (!b.dueAt) comparison = -1;
                    else comparison = a.dueAt - b.dueAt;
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                default:
                    comparison = a.createdAt - b.createdAt;
            }

            return sort.direction === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [tasks, searchQuery, filter, sort]);

    const pendingTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    const handleFormSubmit = (data: TaskFormData) => {
        if (editingTask) {
            updateTask(editingTask.id, data);
        } else {
            addTask({
                ...data,
                status: 'pending',
                completed: false,
            });
        }
        setIsFormOpen(false);
        setEditingTask(null);
    };

    const handleEdit = (task: TaskV2) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
    };

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Tasks</h3>
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                        {pendingTasks.length} pending
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sync status */}
                    {showSyncStatus && googleTasksEnabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => syncGoogleTasks()}
                            disabled={isSyncing}
                            title={isSyncing ? 'Syncing...' : 'Sync with Google Tasks'}
                        >
                            {isSyncing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Cloud className={cn(
                                    'h-4 w-4',
                                    pendingCount > 0 && 'text-yellow-500',
                                    conflictCount > 0 && 'text-red-500'
                                )} />
                            )}
                        </Button>
                    )}

                    {showFilters && (
                        <Button
                            variant={showFiltersPanel ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>
            </div>

            {/* Search */}
            {showSearch && (
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="pl-9 h-9"
                    />
                </div>
            )}

            {/* Filters panel */}
            {showFiltersPanel && (
                <TaskFilters
                    filter={filter}
                    onFilterChange={setFilter}
                    className="mb-3"
                />
            )}

            {/* Task list */}
            <ScrollArea style={{ maxHeight }} className="flex-1 -mx-2">
                <div className="px-2">
                    {/* Pending tasks */}
                    {pendingTasks.length > 0 && (
                        <div className="space-y-1">
                            {pendingTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onComplete={completeTask}
                                    onReopen={reopenTask}
                                    onDelete={deleteTask}
                                    onEdit={handleEdit}
                                    compact={compact}
                                    showSyncStatus={showSyncStatus}
                                />
                            ))}
                        </div>
                    )}

                    {/* Completed section */}
                    {completedTasks.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2 px-3">
                                Completed ({completedTasks.length})
                            </p>
                            <div className="space-y-1">
                                {completedTasks.slice(0, 5).map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onComplete={completeTask}
                                        onReopen={reopenTask}
                                        onDelete={deleteTask}
                                        onEdit={handleEdit}
                                        compact={compact}
                                        showSyncStatus={showSyncStatus}
                                    />
                                ))}
                                {completedTasks.length > 5 && (
                                    <p className="text-xs text-muted-foreground px-3 py-2">
                                        +{completedTasks.length - 5} more completed
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {filteredTasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">
                                {searchQuery ? 'No tasks found' : 'No tasks yet'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    Create your first task
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Task form modal */}
            <TaskForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                task={editingTask}
            />
        </div>
    );
}
