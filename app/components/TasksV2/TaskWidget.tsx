/**
 * TaskWidget Component
 * Task widget for the dashboard grid
 */

'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskStore } from '@/lib/stores/task.store';
import { TaskList } from './TaskList';

interface TaskWidgetProps {
    className?: string;
}

export function TaskWidget({ className }: TaskWidgetProps) {
    const initialize = useTaskStore(s => s.initialize);
    const clearActivities = useTaskStore(s => s.clearActivities);

    // Initialize on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Tasks
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={clearActivities}>
                                Clear Activity Log
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <TaskList
                    compact
                    showFilters={false}
                    showSearch
                    showSyncStatus={false}
                    maxHeight="320px"
                />
            </CardContent>
        </Card>
    );
}
