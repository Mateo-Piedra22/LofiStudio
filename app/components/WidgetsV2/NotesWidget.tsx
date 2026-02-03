/**
 * NotesWidget v2
 * Quick notes with auto-save functionality
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Check } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface NotesWidgetProps {
    id: string;
    settings?: {
        autoSave?: boolean;
        placeholder?: string;
    };
}

const STORAGE_KEY = 'lofi-quick-notes-v2';
const AUTO_SAVE_DELAY = 1000;

/**
 * Quick notes widget with auto-save
 */
export function NotesWidget({ id, settings }: NotesWidgetProps) {
    const [content, setContent] = useState('');
    const [savedContent, setSavedContent] = useState('');
    const [isSaved, setIsSaved] = useState(true);
    const [showSavedIndicator, setShowSavedIndicator] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Settings with defaults
    const autoSave = settings?.autoSave ?? true;
    const placeholder = settings?.placeholder ?? 'Jot down your thoughts...';

    // Load saved content on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setContent(saved);
                setSavedContent(saved);
            }
        } catch (e) {
            console.error('Failed to load notes:', e);
        }
    }, []);

    // Save function
    const saveNotes = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(STORAGE_KEY, content);
            setSavedContent(content);
            setIsSaved(true);
            setShowSavedIndicator(true);

            // Hide indicator after 2 seconds
            setTimeout(() => {
                setShowSavedIndicator(false);
            }, 2000);
        } catch (e) {
            console.error('Failed to save notes:', e);
        }
    }, [content]);

    // Handle content change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        setIsSaved(newContent === savedContent);

        // Auto-save with debounce
        if (autoSave) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(saveNotes, AUTO_SAVE_DELAY);
        }
    }, [savedContent, autoSave, saveNotes]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Actions
    const actions: WidgetAction[] = autoSave ? [] : [
        {
            id: 'save',
            icon: isSaved ? 'Check' : 'Save',
            label: isSaved ? 'Saved' : 'Save',
            onClick: saveNotes,
            disabled: isSaved,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Quick Notes"
            icon="StickyNote"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="flex flex-col p-2"
        >
            <div className="relative flex-1 min-h-0">
                {/* Textarea */}
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full h-full min-h-0 resize-none rounded-lg bg-background/50 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-shadow"
                    aria-label="Quick notes"
                    spellCheck={false}
                />

                {/* Saved indicator */}
                {showSavedIndicator && autoSave && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded"
                    >
                        <Check className="w-3 h-3 text-green-500" />
                        Saved
                    </motion.div>
                )}
            </div>
        </WidgetWrapper>
    );
}

export default NotesWidget;
