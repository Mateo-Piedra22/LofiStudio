/**
 * QuickLinksWidget v2
 * Customizable quick links/bookmarks
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Plus, X, Edit2, Trash2, ExternalLink, Globe } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface QuickLink {
    id: string;
    title: string;
    url: string;
    icon?: string;
    color?: string;
}

interface QuickLinksWidgetProps {
    id: string;
    settings?: {
        maxLinks?: number;
        openInNewTab?: boolean;
    };
}

const STORAGE_KEY = 'lofi-quick-links-v2';

const DEFAULT_LINKS: QuickLink[] = [
    { id: '1', title: 'Google', url: 'https://google.com', color: '#4285F4' },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', color: '#FF0000' },
    { id: '3', title: 'GitHub', url: 'https://github.com', color: '#333333' },
    { id: '4', title: 'Twitter', url: 'https://twitter.com', color: '#1DA1F2' },
];

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

// Get favicon URL
const getFaviconUrl = (url: string): string => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return '';
    }
};

/**
 * Quick links/bookmarks widget
 */
export function QuickLinksWidget({ id, settings }: QuickLinksWidgetProps) {
    const [links, setLinks] = useState<QuickLink[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newColor, setNewColor] = useState(COLORS[0]);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const maxLinks = settings?.maxLinks ?? 8;
    const openInNewTab = settings?.openInNewTab ?? true;

    // Load links
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setLinks(JSON.parse(saved));
            } else {
                setLinks(DEFAULT_LINKS);
            }
        } catch (e) {
            setLinks(DEFAULT_LINKS);
        }
    }, []);

    // Save links
    const saveLinks = useCallback((newLinks: QuickLink[]) => {
        setLinks(newLinks);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
        }
    }, []);

    // Add link
    const addLink = useCallback(() => {
        if (!newTitle.trim() || !newUrl.trim()) return;

        let url = newUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const link: QuickLink = {
            id: Date.now().toString(),
            title: newTitle.trim(),
            url,
            color: newColor,
        };

        saveLinks([...links, link]);
        resetForm();
    }, [newTitle, newUrl, newColor, links, saveLinks]);

    // Edit link
    const startEdit = useCallback((link: QuickLink) => {
        setEditingId(link.id);
        setNewTitle(link.title);
        setNewUrl(link.url);
        setNewColor(link.color || COLORS[0]);
        setIsAdding(true);
    }, []);

    // Save edit
    const saveEdit = useCallback(() => {
        if (!newTitle.trim() || !newUrl.trim() || !editingId) return;

        let url = newUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        saveLinks(links.map(link =>
            link.id === editingId
                ? { ...link, title: newTitle.trim(), url, color: newColor }
                : link
        ));

        resetForm();
    }, [editingId, newTitle, newUrl, newColor, links, saveLinks]);

    // Remove link
    const removeLink = useCallback((linkId: string) => {
        saveLinks(links.filter(l => l.id !== linkId));
    }, [links, saveLinks]);

    // Reset form
    const resetForm = useCallback(() => {
        setIsAdding(false);
        setEditingId(null);
        setNewTitle('');
        setNewUrl('');
        setNewColor(COLORS[0]);
    }, []);

    // Open link
    const openLink = useCallback((url: string) => {
        if (openInNewTab) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    }, [openInNewTab]);

    // Actions
    const actions: WidgetAction[] = links.length < maxLinks && !isAdding ? [
        {
            id: 'add',
            icon: 'Plus',
            label: 'Add link',
            onClick: () => setIsAdding(true),
        },
    ] : [];

    return (
        <WidgetWrapper
            id={id}
            title="Quick Links"
            icon="Link"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* Add/Edit form */}
                    {isAdding && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pb-2 border-b border-border/50"
                        >
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Title"
                                className="h-7 text-xs"
                                autoFocus
                            />
                            <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="URL (e.g., google.com)"
                                className="h-7 text-xs"
                            />
                            {/* Color picker */}
                            <div className="flex gap-1 flex-wrap">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewColor(color)}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-transform',
                                            newColor === color && 'ring-2 ring-offset-1 ring-foreground scale-110'
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs"
                                    onClick={editingId ? saveEdit : addLink}
                                    disabled={!newTitle.trim() || !newUrl.trim()}
                                >
                                    {editingId ? 'Save' : 'Add'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Links grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                        {links.map((link, index) => (
                            <motion.div
                                key={link.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.03 }}
                                className="group relative"
                            >
                                <button
                                    onClick={() => openLink(link.url)}
                                    className={cn(
                                        'w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1.5 p-2',
                                        'border border-transparent hover:border-border',
                                        'transition-all duration-200',
                                        'hover:scale-105 hover:shadow-md'
                                    )}
                                    style={{
                                        backgroundColor: `${link.color}20`,
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        className="w-6 h-6 rounded-md flex items-center justify-center"
                                        style={{ backgroundColor: link.color }}
                                    >
                                        <img
                                            src={getFaviconUrl(link.url)}
                                            alt=""
                                            className="w-4 h-4"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Title */}
                                    <span className="text-[10px] text-foreground truncate w-full text-center">
                                        {link.title}
                                    </span>
                                </button>

                                {/* Edit/Remove buttons */}
                                <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startEdit(link);
                                        }}
                                        className="p-1 rounded-full bg-background border border-border hover:bg-muted shadow-sm"
                                    >
                                        <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeLink(link.id);
                                        }}
                                        className="p-1 rounded-full bg-background border border-border hover:bg-destructive/20 hover:text-destructive shadow-sm"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add button when not editing */}
                        {links.length < maxLinks && !isAdding && (
                            <motion.button
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setIsAdding(true)}
                                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/50 transition-colors"
                            >
                                <Plus className="w-5 h-5 text-muted-foreground" />
                            </motion.button>
                        )}
                    </div>

                    {/* Empty state */}
                    {links.length === 0 && !isAdding && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Link className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-xs text-muted-foreground">No links yet</p>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default QuickLinksWidget;
