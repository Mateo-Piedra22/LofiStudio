/**
 * TasksWidget v2
 * Task manager with categories and persistence
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, GripVertical, ListTodo, Filter } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    priority: 'low' | 'medium' | 'high';
}

interface TasksWidgetProps {
    id: string;
    settings?: {
        showCompleted?: boolean;
        maxTasks?: number;
    };
}

const STORAGE_KEY = 'lofi-tasks-v2';

const PRIORITY_COLORS = {
    low: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    high: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

/**
 * Task manager widget
 */
export function TasksWidget({ id, settings }: TasksWidgetProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const showCompleted = settings?.showCompleted ?? true;
    const maxTasks = settings?.maxTasks ?? 10;

    // Load tasks
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setTasks(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load tasks:', e);
        }
    }, []);

    // Save tasks
    const saveTasks = useCallback((newTasks: Task[]) => {
        setTasks(newTasks);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        }
    }, []);

    // Add task
    const addTask = useCallback(() => {
        if (!newTaskText.trim()) return;
        if (tasks.length >= maxTasks) return;

        const task: Task = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            priority: selectedPriority,
        };

        saveTasks([task, ...tasks]);
        setNewTaskText('');
        setIsAdding(false);
    }, [newTaskText, tasks, maxTasks, selectedPriority, saveTasks]);

    // Toggle task
    const toggleTask = useCallback((taskId: string) => {
        saveTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    }, [tasks, saveTasks]);

    // Remove task
    const removeTask = useCallback((taskId: string) => {
        saveTasks(tasks.filter(task => task.id !== taskId));
    }, [tasks, saveTasks]);

    // Clear completed
    const clearCompleted = useCallback(() => {
        saveTasks(tasks.filter(task => !task.completed));
    }, [tasks, saveTasks]);

    // Reorder tasks
    const handleReorder = useCallback((reordered: Task[]) => {
        saveTasks(reordered);
    }, [saveTasks]);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return showCompleted || !task.completed;
    });

    // Stats
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'clear',
            icon: 'Trash2',
            label: 'Clear completed',
            onClick: clearCompleted,
            disabled: completedCount === 0,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Tasks"
            icon="ListTodo"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-2 overflow-hidden">
                {/* Add task */}
                <AnimatePresence>
                    {isAdding ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <Input
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="What needs to be done?"
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addTask();
                                    if (e.key === 'Escape') {
                                        setIsAdding(false);
                                        setNewTaskText('');
                                    }
                                }}
                            />
                            {/* Priority selector */}
                            <div className="flex gap-1">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPriority(p)}
                                        className={cn(
                                            'flex-1 py-1 text-xs rounded capitalize transition-colors',
                                            selectedPriority === p
                                                ? PRIORITY_COLORS[p]
                                                : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewTaskText('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={addTask}
                                    disabled={!newTaskText.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsAdding(true)}
                            className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground',
                                'hover:text-foreground hover:bg-muted/50 rounded transition-colors',
                                tasks.length >= maxTasks && 'opacity-50 pointer-events-none'
                            )}
                            disabled={tasks.length >= maxTasks}
                        >
                            <Plus className="w-3 h-3" />
                            Add task
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Filter tabs */}
                {tasks.length > 0 && (
                    <div className="flex gap-1 p-0.5 bg-muted/30 rounded text-xs">
                        {(['all', 'active', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    'flex-1 py-1 rounded capitalize transition-colors',
                                    filter === f
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}

                {/* Task list */}
                <div className="flex-1 overflow-y-auto">
                    {filteredTasks.length > 0 ? (
                        <Reorder.Group
                            axis="y"
                            values={filteredTasks}
                            onReorder={handleReorder}
                            className="space-y-1"
                        >
                            {filteredTasks.map((task) => (
                                <Reorder.Item
                                    key={task.id}
                                    value={task}
                                    className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
                                >
                                    {/* Drag handle */}
                                    <GripVertical className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="flex-shrink-0"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                                        )}
                                    </button>

                                    {/* Task text */}
                                    <span className={cn(
                                        'flex-1 text-xs truncate',
                                        task.completed && 'line-through text-muted-foreground'
                                    )}>
                                        {task.text}
                                    </span>

                                    {/* Priority indicator */}
                                    <span className={cn(
                                        'px-1.5 py-0.5 text-[10px] rounded',
                                        PRIORITY_COLORS[task.priority]
                                    )}>
                                        {task.priority.charAt(0).toUpperCase()}
                                    </span>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => removeTask(task.id)}
                                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <ListTodo className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-xs text-muted-foreground">
                                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                {tasks.length > 0 && (
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>{totalCount - completedCount} remaining</span>
                        <span>{completedCount} completed</span>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}

export default TasksWidget;
