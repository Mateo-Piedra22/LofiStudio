/**
 * TaskForm Component
 * Create and edit task form
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskV2, TaskPriority } from '@/lib/types/task.types';
import { format } from 'date-fns';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => void;
    task?: TaskV2 | null;
    isLoading?: boolean;
}

export interface TaskFormData {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueAt?: number;
    tags: string[];
    color?: string;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; icon: string }[] = [
    { value: 'urgent', label: 'Urgent', icon: '🔴' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '⚪' },
];

const COLOR_OPTIONS = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
];

export function TaskForm({ open, onClose, onSubmit, task, isLoading }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [color, setColor] = useState<string | undefined>();

    const isEdit = !!task;

    // Populate form when editing
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setDueDate(task.dueAt ? new Date(task.dueAt) : undefined);
            setTags(task.tags || []);
            setColor(task.color);
        } else {
            // Reset form for new task
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate(undefined);
            setTags([]);
            setColor(undefined);
        }
    }, [task, open]);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            dueAt: dueDate?.getTime(),
            tags,
            color,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Edit Task' : 'Create Task'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details..."
                                rows={3}
                            />
                        </div>

                        {/* Priority and Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <span className="flex items-center gap-2">
                                                    {opt.icon} {opt.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !dueDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dueDate}
                                            onSelect={setDueDate}
                                            initialFocus
                                        />
                                        {dueDate && (
                                            <div className="p-2 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => setDueDate(undefined)}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags</label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-accent rounded-full text-xs flex items-center gap-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Color</label>
                            <div className="flex gap-2">
                                {COLOR_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setColor(color === opt.value ? undefined : opt.value)}
                                        className={cn(
                                            'w-8 h-8 rounded-full transition-all',
                                            color === opt.value && 'ring-2 ring-offset-2 ring-primary'
                                        )}
                                        style={{ backgroundColor: opt.value }}
                                        title={opt.label}
                                    />
                                ))}
                                {color && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setColor(undefined)}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!title.trim() || isLoading}>
                            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
