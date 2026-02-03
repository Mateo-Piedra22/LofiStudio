/**
 * EmbedWidget v2
 * Embed external content like YouTube, Spotify, etc.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ExternalLink, Settings, X, RefreshCw, Play } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface EmbedConfig {
    url: string;
    type: 'youtube' | 'spotify' | 'soundcloud' | 'iframe' | 'unknown';
    embedUrl: string;
    title?: string;
}

interface EmbedWidgetProps {
    id: string;
    settings?: {
        defaultUrl?: string;
    };
}

const STORAGE_KEY_PREFIX = 'lofi-embed-';

// Parse URL and get embed config
function parseEmbedUrl(url: string): EmbedConfig | null {
    if (!url.trim()) return null;

    try {
        const urlObj = new URL(url);

        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId = '';

            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.searchParams.has('v')) {
                videoId = urlObj.searchParams.get('v') || '';
            }

            if (videoId) {
                return {
                    url,
                    type: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    title: 'YouTube Video',
                };
            }
        }

        // Spotify
        if (urlObj.hostname.includes('spotify.com')) {
            // Convert open.spotify.com/track/xxx to embed
            const parts = urlObj.pathname.split('/');
            if (parts.length >= 3) {
                const type = parts[1]; // track, playlist, album, etc.
                const id = parts[2];
                return {
                    url,
                    type: 'spotify',
                    embedUrl: `https://open.spotify.com/embed/${type}/${id}?theme=0`,
                    title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                };
            }
        }

        // SoundCloud
        if (urlObj.hostname.includes('soundcloud.com')) {
            return {
                url,
                type: 'soundcloud',
                embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
                title: 'SoundCloud',
            };
        }

        // Generic iframe
        return {
            url,
            type: 'iframe',
            embedUrl: url,
            title: urlObj.hostname,
        };

    } catch (e) {
        return null;
    }
}

/**
 * External embed widget
 */
export function EmbedWidget({ id, settings }: EmbedWidgetProps) {
    const [embedConfig, setEmbedConfig] = useState<EmbedConfig | null>(null);
    const [inputUrl, setInputUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`;

    // Load saved embed
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setEmbedConfig(JSON.parse(saved));
            } else if (settings?.defaultUrl) {
                const config = parseEmbedUrl(settings.defaultUrl);
                if (config) {
                    setEmbedConfig(config);
                }
            }
        } catch (e) {
            console.error('Failed to load embed:', e);
        }
    }, [storageKey, settings?.defaultUrl]);

    // Save embed config
    const saveConfig = useCallback((config: EmbedConfig | null) => {
        setEmbedConfig(config);
        if (typeof window !== 'undefined') {
            if (config) {
                localStorage.setItem(storageKey, JSON.stringify(config));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    // Apply URL
    const applyUrl = useCallback(() => {
        setError(null);

        const config = parseEmbedUrl(inputUrl);
        if (config) {
            saveConfig(config);
            setIsEditing(false);
            setInputUrl('');
        } else {
            setError('Could not parse URL. Please enter a valid YouTube, Spotify, or SoundCloud link.');
        }
    }, [inputUrl, saveConfig]);

    // Clear embed
    const clearEmbed = useCallback(() => {
        saveConfig(null);
        setIsEditing(false);
        setInputUrl('');
    }, [saveConfig]);

    // Get type icon/label
    const getTypeInfo = (type: EmbedConfig['type']) => {
        switch (type) {
            case 'youtube': return { icon: '▶️', label: 'YouTube', color: 'text-red-500' };
            case 'spotify': return { icon: '🎵', label: 'Spotify', color: 'text-green-500' };
            case 'soundcloud': return { icon: '☁️', label: 'SoundCloud', color: 'text-orange-500' };
            default: return { icon: '🔗', label: 'Embed', color: 'text-blue-500' };
        }
    };

    // Actions
    const actions: WidgetAction[] = embedConfig ? [
        {
            id: 'edit',
            icon: 'Settings',
            label: 'Change embed',
            onClick: () => {
                setInputUrl(embedConfig.url);
                setIsEditing(true);
            },
        },
        {
            id: 'external',
            icon: 'ExternalLink',
            label: 'Open in new tab',
            onClick: () => window.open(embedConfig.url, '_blank'),
        },
    ] : [];

    return (
        <WidgetWrapper
            id={id}
            title="Embed"
            icon="Link2"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-0 overflow-hidden"
        >
            <div className="h-full w-full flex flex-col">
                <AnimatePresence mode="wait">
                    {/* Editing mode */}
                    {isEditing && (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col p-3 gap-2"
                        >
                            <p className="text-xs text-muted-foreground">
                                Paste a link to embed content
                            </p>
                            <Input
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyUrl();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                            />

                            {/* Supported platforms */}
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>Supported:</span>
                                <span className="text-red-500">YouTube</span>
                                <span className="text-green-500">Spotify</span>
                                <span className="text-orange-500">SoundCloud</span>
                            </div>

                            {error && (
                                <p className="text-xs text-destructive">{error}</p>
                            )}

                            <div className="flex gap-2 mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setInputUrl('');
                                        setError(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                {embedConfig && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearEmbed}
                                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={applyUrl}
                                    disabled={!inputUrl.trim()}
                                >
                                    Embed
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Embed display */}
                    {!isEditing && embedConfig && (
                        <motion.div
                            key="embed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full relative"
                        >
                            <iframe
                                src={embedConfig.embedUrl}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                title={embedConfig.title || 'Embedded content'}
                            />

                            {/* Type badge */}
                            <div className={cn(
                                'absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium',
                                'bg-background/80 backdrop-blur-sm',
                                getTypeInfo(embedConfig.type).color
                            )}>
                                {getTypeInfo(embedConfig.type).icon} {getTypeInfo(embedConfig.type).label}
                            </div>
                        </motion.div>
                    )}

                    {/* Empty state */}
                    {!isEditing && !embedConfig && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center p-4"
                        >
                            <Link2 className="w-10 h-10 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground mb-1">
                                Embed external content
                            </p>
                            <p className="text-xs text-muted-foreground/70 mb-4">
                                YouTube, Spotify, SoundCloud & more
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Link2 className="w-3 h-3 mr-1" />
                                Add embed
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WidgetWrapper>
    );
}

export default EmbedWidget;
