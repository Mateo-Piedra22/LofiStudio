/**
 * TaskFilters Component
 * Filter controls for task list
 */

'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { TaskFilter, TaskStatus, TaskPriority } from '@/lib/types/task.types';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
    filter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
    className?: string;
}

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Priority', icon: '' },
    { value: 'urgent', label: 'Urgent', icon: '🔴' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '⚪' },
];

export function TaskFilters({ filter, onFilterChange, className }: TaskFiltersProps) {
    const hasActiveFilters = filter.status || filter.priority || filter.tags?.length;

    const handleStatusChange = (value: string) => {
        if (value === 'all') {
            const { status, ...rest } = filter;
            onFilterChange(rest);
        } else {
            onFilterChange({ ...filter, status: value as TaskStatus });
        }
    };

    const handlePriorityChange = (value: string) => {
        if (value === 'all') {
            const { priority, ...rest } = filter;
            onFilterChange(rest);
        } else {
            onFilterChange({ ...filter, priority: value as TaskPriority });
        }
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {/* Status filter */}
            <Select
                value={filter.status as string || 'all'}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select
                value={filter.priority as string || 'all'}
                onValueChange={handlePriorityChange}
            >
                <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                                {opt.icon && <span>{opt.icon}</span>}
                                {opt.label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Clear filters button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={clearFilters}
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}
