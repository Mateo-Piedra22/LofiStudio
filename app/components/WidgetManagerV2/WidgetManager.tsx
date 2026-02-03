/**
 * WidgetManager v2
 * Widget catalog with add/remove functionality
 * Uses new widget-grid.store for state management
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Search, X, Grid3X3,
    Clock, Globe, Cloud, Image, CheckSquare, Timer, StickyNote,
    Quote, Calendar, Wind, BookOpen, Activity, Target, Calculator,
    Link, Layers, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import {
    WIDGET_DEFINITIONS,
    WIDGETS_BY_CATEGORY,
    CATEGORY_LABELS,
    getWidgetDefinition,
} from '@/lib/constants/widgets';
import type { WidgetType, WidgetCategory } from '@/lib/types/widget.types';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════════
// Icon Map
// ═══════════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Clock,
    Globe,
    Cloud,
    Image,
    CheckSquare,
    Timer,
    StickyNote,
    Quote,
    Calendar,
    Wind,
    BookOpen,
    Activity,
    Target,
    Calculator,
    Link,
    Layers,
    ExternalLink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface WidgetManagerProps {
    compact?: boolean;
    onClose?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export function WidgetManager({ compact = false, onClose }: WidgetManagerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all');

    // Get store state and actions (using correct property names)
    const widgets = useWidgetGridStore(state => state.widgets);
    const addWidget = useWidgetGridStore(state => state.addWidget);
    const removeWidget = useWidgetGridStore(state => state.removeWidget);
    const toggleWidgetVisibility = useWidgetGridStore(state => state.toggleWidgetVisibility);

    // Get visible widget types (using isVisible, not enabled)
    const visibleTypes = useMemo(() => {
        return new Set(widgets.filter(w => w.isVisible).map(w => w.type));
    }, [widgets]);

    // Get all active widget types (regardless of visibility)
    const activeTypes = useMemo(() => {
        return new Set(widgets.map(w => w.type));
    }, [widgets]);

    // Filter widgets based on search and category
    const filteredWidgets = useMemo(() => {
        const allTypes = selectedCategory === 'all'
            ? Object.keys(WIDGET_DEFINITIONS) as WidgetType[]
            : WIDGETS_BY_CATEGORY[selectedCategory];

        if (!searchQuery.trim()) {
            return allTypes;
        }

        const query = searchQuery.toLowerCase();
        return allTypes.filter(type => {
            const def = WIDGET_DEFINITIONS[type];
            return (
                def.label.toLowerCase().includes(query) ||
                def.description.toLowerCase().includes(query) ||
                type.toLowerCase().includes(query)
            );
        });
    }, [selectedCategory, searchQuery]);

    // Group by category for display
    const groupedWidgets = useMemo(() => {
        if (selectedCategory !== 'all') {
            return { [selectedCategory]: filteredWidgets };
        }

        const groups: Partial<Record<WidgetCategory, WidgetType[]>> = {};
        filteredWidgets.forEach(type => {
            const def = WIDGET_DEFINITIONS[type];
            if (!groups[def.category]) {
                groups[def.category] = [];
            }
            groups[def.category]!.push(type);
        });

        return groups;
    }, [filteredWidgets, selectedCategory]);

    // Toggle widget
    const toggleWidget = useCallback((type: WidgetType) => {
        const existingWidget = widgets.find(w => w.type === type);

        if (existingWidget) {
            // If widget exists but is hidden, show it; otherwise remove it
            if (!existingWidget.isVisible) {
                toggleWidgetVisibility(existingWidget.id);
            } else {
                removeWidget(existingWidget.id);
            }
        } else {
            // Add the widget (addWidget only needs type, position is optional)
            addWidget(type);
        }
    }, [widgets, addWidget, removeWidget, toggleWidgetVisibility]);

    // Get icon component
    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || Grid3X3;
    };

    return (
        <div className={cn('flex flex-col gap-4', compact ? 'max-h-[60vh]' : '')}>
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search widgets..."
                    className="pl-9"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-sm"
                >
                    All
                </Button>
                {(Object.keys(CATEGORY_LABELS) as WidgetCategory[]).map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="text-sm"
                    >
                        {CATEGORY_LABELS[cat]}
                    </Button>
                ))}
            </div>

            {/* Widget count */}
            <div className="text-sm text-muted-foreground">
                {visibleTypes.size} widget{visibleTypes.size !== 1 ? 's' : ''} active
            </div>

            {/* Widget grid */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {Object.entries(groupedWidgets).map(([category, types]) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            {selectedCategory === 'all' && (
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                    {CATEGORY_LABELS[category as WidgetCategory]}
                                </h3>
                            )}

                            <div className={cn(
                                'grid gap-3',
                                compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                            )}>
                                {(types as WidgetType[]).map((type) => {
                                    const def = WIDGET_DEFINITIONS[type];
                                    const isActive = visibleTypes.has(type);
                                    const IconComponent = getIcon(def.icon);

                                    return (
                                        <motion.button
                                            key={type}
                                            layout
                                            layoutId={type}
                                            onClick={() => toggleWidget(type)}
                                            className={cn(
                                                'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                                                'hover:shadow-md',
                                                isActive
                                                    ? 'bg-primary/10 border-primary/50 text-primary'
                                                    : 'bg-muted/30 border-border hover:bg-muted/50'
                                            )}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                                >
                                                    <Check className="w-3 h-3 text-primary-foreground" />
                                                </motion.div>
                                            )}

                                            {/* Icon */}
                                            <div className={cn(
                                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                                isActive ? 'bg-primary/20' : 'bg-muted'
                                            )}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>

                                            {/* Label */}
                                            <span className="text-sm font-medium text-center">
                                                {def.label}
                                            </span>

                                            {/* Size badge */}
                                            <span className={cn(
                                                'text-xs px-2 py-0.5 rounded-full',
                                                isActive ? 'bg-primary/20' : 'bg-muted'
                                            )}>
                                                {def.defaultSize}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty state */}
                {filteredWidgets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="w-10 h-10 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No widgets match your search</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="mt-2"
                        >
                            Clear filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WidgetManager;
