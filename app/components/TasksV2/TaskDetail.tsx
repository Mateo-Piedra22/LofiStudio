/**
 * TaskDetail Component
 * Full task detail view with activity log
 */

'use client';

import { useMemo } from 'react';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    Flag,
    Tag,
    Cloud,
    CloudOff,
    History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTaskStore } from '@/lib/stores/task.store';
import type { TaskV2, TaskActivity } from '@/lib/types/task.types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface TaskDetailProps {
    taskId: string;
    onBack: () => void;
    className?: string;
}

const priorityLabels = {
    urgent: { label: 'Urgent', color: 'bg-red-500' },
    high: { label: 'High', color: 'bg-orange-500' },
    medium: { label: 'Medium', color: 'bg-yellow-500' },
    low: { label: 'Low', color: 'bg-gray-400' },
};

export function TaskDetail({ taskId, onBack, className }: TaskDetailProps) {
    const task = useTaskStore(s => s.tasks.find(t => t.id === taskId));
    const activities = useTaskStore(s => s.activities);

    const taskActivities = useMemo(() => {
        return activities.filter(a => a.taskId === taskId).slice(0, 20);
    }, [activities, taskId]);

    if (!task) {
        return (
            <div className={cn('p-4', className)}>
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <p className="text-center text-muted-foreground mt-8">
                    Task not found
                </p>
            </div>
        );
    }

    const priority = priorityLabels[task.priority];

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h2 className={cn(
                        'font-semibold truncate',
                        task.completed && 'line-through text-muted-foreground'
                    )}>
                        {task.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className={cn('text-white border-0', priority.color)}
                >
                    {priority.label}
                </Badge>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Description */}
                    {task.description && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Due date */}
                        {task.dueAt && (
                            <div className="flex items-start gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Due Date</p>
                                    <p className="text-sm font-medium">
                                        {format(task.dueAt, 'PPP')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        {task.actualDuration && (
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Time Spent</p>
                                    <p className="text-sm font-medium">
                                        {Math.floor(task.actualDuration / 60)} min
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sync status */}
                        <div className="flex items-start gap-2">
                            {task.syncInfo?.syncStatus === 'synced' ? (
                                <Cloud className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : (
                                <CloudOff className="h-4 w-4 text-muted-foreground mt-0.5" />
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">Sync Status</p>
                                <p className="text-sm font-medium capitalize">
                                    {task.syncInfo?.syncStatus || 'Local only'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Activity log */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Activity
                        </h4>
                        <div className="space-y-3">
                            {taskActivities.length > 0 ? (
                                taskActivities.map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No activity recorded
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

function ActivityItem({ activity }: { activity: TaskActivity }) {
    const actionColors = {
        created: 'text-green-500',
        updated: 'text-blue-500',
        completed: 'text-green-500',
        reopened: 'text-yellow-500',
        deleted: 'text-red-500',
        synced: 'text-blue-500',
        conflict_resolved: 'text-purple-500',
    };

    return (
        <div className="flex items-start gap-3">
            <div className={cn(
                'w-2 h-2 rounded-full mt-1.5',
                actionColors[activity.action]?.replace('text-', 'bg-')
            )} />
            <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.details}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
