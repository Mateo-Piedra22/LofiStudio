/**
 * GifWidget v2
 * Displays lofi-themed animated GIFs
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface GifData {
    url: string;
    title: string;
    source?: string;
}

interface GifWidgetProps {
    id: string;
    settings?: {
        category?: string;
        autoRefresh?: boolean;
        refreshInterval?: number; // minutes
    };
}

// Fallback GIFs for when API fails
const FALLBACK_GIFS: GifData[] = [
    {
        url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        title: 'Lofi room',
        source: 'giphy'
    },
    {
        url: 'https://media.giphy.com/media/xTiTnxpQ3ghPiB2Hp6/giphy.gif',
        title: 'Rain window',
        source: 'giphy'
    },
    {
        url: 'https://media.giphy.com/media/3o7TKSxdQJIoiRXHl6/giphy.gif',
        title: 'Study desk',
        source: 'giphy'
    },
];

const SEARCH_TERMS = [
    'lofi aesthetic',
    'cozy rain',
    'study anime',
    'pixel art room',
    'chill cafe',
    'rainy window',
];

/**
 * Animated GIF widget
 */
export function GifWidget({ id, settings }: GifWidgetProps) {
    const [gif, setGif] = useState<GifData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Settings with defaults
    const category = settings?.category ?? 'lofi';
    const autoRefresh = settings?.autoRefresh ?? false;
    const refreshInterval = settings?.refreshInterval ?? 30;

    // Fetch a random GIF
    const fetchGif = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Pick a random search term
            const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];

            // Try to fetch from GIPHY API through our proxy
            const response = await fetch(`/api/giphy?q=${encodeURIComponent(searchTerm)}`, {
                signal: AbortSignal.timeout(8000),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const randomGif = data.data[Math.floor(Math.random() * data.data.length)];
                    setGif({
                        url: randomGif.images?.original?.url || randomGif.images?.fixed_height?.url,
                        title: randomGif.title || 'Lofi GIF',
                        source: 'giphy',
                    });
                } else {
                    throw new Error('No GIFs found');
                }
            } else {
                throw new Error('API request failed');
            }
        } catch (e) {
            // Use fallback
            const randomFallback = FALLBACK_GIFS[Math.floor(Math.random() * FALLBACK_GIFS.length)];
            setGif(randomFallback);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchGif();
    }, [fetchGif]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchGif();
        }, refreshInterval * 60 * 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchGif]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'refresh',
            icon: 'RefreshCw',
            label: 'New GIF',
            onClick: fetchGif,
            disabled: isLoading,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Chill Vibes"
            icon="Image"
            showHeader={showHeaders}
            actions={actions}
            isLoading={isLoading && !gif}
            error={error}
            onRefresh={fetchGif}
            contentClassName="p-0 overflow-hidden"
        >
            <AnimatePresence mode="wait">
                {gif && (
                    <motion.div
                        key={gif.url}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full"
                    >
                        {/* GIF image */}
                        <div className="absolute inset-0">
                            {/* Using regular img tag for GIFs since Next/Image doesn't handle them well */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={gif.url}
                                alt={gif.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        {/* Gradient overlay at bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Title */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <span className="text-xs text-white/80 truncate max-w-[70%]">
                                {gif.title}
                            </span>
                            {gif.source === 'giphy' && (
                                <a
                                    href="https://giphy.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-white/60 hover:text-white/90 transition-colors"
                                >
                                    GIPHY
                                </a>
                            )}
                        </div>

                        {/* Loading overlay during refresh */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/30 flex items-center justify-center"
                            >
                                <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </WidgetWrapper>
    );
}

export default GifWidget;
