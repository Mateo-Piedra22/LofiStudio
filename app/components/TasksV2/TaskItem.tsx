/**
 * TaskItem Component
 * Individual task item with actions
 */

'use client';

import { memo, useState } from 'react';
import {
    Check,
    MoreHorizontal,
    Trash2,
    Edit2,
    Clock,
    AlertCircle,
    Calendar as CalendarIcon,
    Flag,
    RefreshCw,
    Cloud,
    CloudOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TaskV2, TaskPriority } from '@/lib/types/task.types';

interface TaskItemProps {
    task: TaskV2;
    onComplete: (id: string) => void;
    onReopen: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: TaskV2) => void;
    compact?: boolean;
    showSyncStatus?: boolean;
}

const priorityConfig: Record<TaskPriority, { color: string; icon: string }> = {
    urgent: { color: 'text-red-500', icon: '🔴' },
    high: { color: 'text-orange-500', icon: '🟠' },
    medium: { color: 'text-yellow-500', icon: '🟡' },
    low: { color: 'text-gray-400', icon: '⚪' },
};

function formatDueDate(dueAt?: number): string {
    if (!dueAt) return '';

    const now = new Date();
    const due = new Date(dueAt);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;

    return due.toLocaleDateString();
}

function isOverdue(task: TaskV2): boolean {
    if (!task.dueAt || task.completed) return false;
    return task.dueAt < Date.now();
}

export const TaskItem = memo(function TaskItem({
    task,
    onComplete,
    onReopen,
    onDelete,
    onEdit,
    compact = false,
    showSyncStatus = false,
}: TaskItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    const overdue = isOverdue(task);
    const priority = priorityConfig[task.priority];
    const syncStatus = task.syncInfo?.syncStatus;

    return (
        <div
            className={cn(
                'group flex items-start gap-3 p-3 rounded-lg transition-all',
                'hover:bg-accent/50',
                task.completed && 'opacity-60',
                overdue && !task.completed && 'bg-red-500/5'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Checkbox */}
            <button
                onClick={() => task.completed ? onReopen(task.id) : onComplete(task.id)}
                className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all mt-0.5',
                    'flex items-center justify-center',
                    task.completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/40 hover:border-primary',
                    task.color && !task.completed && `border-[${task.color}]`
                )}
                style={task.color && !task.completed ? { borderColor: task.color } : undefined}
            >
                {task.completed && <Check className="w-3 h-3" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {/* Priority indicator */}
                    {task.priority !== 'medium' && (
                        <span className="text-xs">{priority.icon}</span>
                    )}

                    {/* Title */}
                    <span className={cn(
                        'text-sm font-medium truncate',
                        task.completed && 'line-through text-muted-foreground'
                    )}>
                        {task.title}
                    </span>
                </div>

                {/* Meta row */}
                {!compact && (task.description || task.dueAt || task.tags.length > 0) && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {/* Due date */}
                        {task.dueAt && (
                            <span className={cn(
                                'flex items-center gap-1',
                                overdue && !task.completed && 'text-red-500 font-medium'
                            )}>
                                {overdue ? (
                                    <AlertCircle className="w-3 h-3" />
                                ) : (
                                    <CalendarIcon className="w-3 h-3" />
                                )}
                                {formatDueDate(task.dueAt)}
                            </span>
                        )}

                        {/* Tags */}
                        {task.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                                {task.tags.slice(0, 2).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-1.5 py-0.5 bg-accent rounded text-[10px]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {task.tags.length > 2 && (
                                    <span className="text-[10px]">
                                        +{task.tags.length - 2}
                                    </span>
                                )}
                            </span>
                        )}

                        {/* Sync status */}
                        {showSyncStatus && syncStatus && (
                            <span className="flex items-center gap-1">
                                {syncStatus === 'synced' && (
                                    <Cloud className="w-3 h-3 text-green-500" />
                                )}
                                {syncStatus === 'pending' && (
                                    <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />
                                )}
                                {syncStatus === 'error' && (
                                    <CloudOff className="w-3 h-3 text-red-500" />
                                )}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={cn(
                'flex items-center gap-1 transition-opacity',
                isHovered ? 'opacity-100' : 'opacity-0'
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => task.completed ? onReopen(task.id) : onComplete(task.id)}>
                            {task.completed ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reopen
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Complete
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(task.id)}
                            className="text-red-500 focus:text-red-500"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
});
