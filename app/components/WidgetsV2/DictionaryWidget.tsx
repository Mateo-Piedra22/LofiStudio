/**
 * DictionaryWidget v2
 * Word lookup with definitions and pronunciation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Volume2, BookOpen, ArrowRight } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface Definition {
    partOfSpeech: string;
    definitions: {
        definition: string;
        example?: string;
    }[];
}

interface WordData {
    word: string;
    phonetic?: string;
    audio?: string;
    meanings: Definition[];
}

interface DictionaryWidgetProps {
    id: string;
    settings?: {
        language?: string;
    };
}

/**
 * Dictionary lookup widget
 */
export function DictionaryWidget({ id, settings }: DictionaryWidgetProps) {
    const [query, setQuery] = useState('');
    const [wordData, setWordData] = useState<WordData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentWords, setRecentWords] = useState<string[]>([]);

    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Search for word
    const searchWord = useCallback(async (word?: string) => {
        const searchTerm = word || query.trim();
        if (!searchTerm) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchTerm)}`,
                { signal: AbortSignal.timeout(10000) }
            );

            if (!response.ok) {
                throw new Error('Word not found');
            }

            const data = await response.json();
            const entry = data[0];

            // Extract audio URL
            let audioUrl: string | undefined;
            for (const phonetic of entry.phonetics || []) {
                if (phonetic.audio) {
                    audioUrl = phonetic.audio;
                    break;
                }
            }

            setWordData({
                word: entry.word,
                phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
                audio: audioUrl,
                meanings: entry.meanings.map((m: any) => ({
                    partOfSpeech: m.partOfSpeech,
                    definitions: m.definitions.slice(0, 2).map((d: any) => ({
                        definition: d.definition,
                        example: d.example,
                    })),
                })),
            });

            // Add to recent words
            setRecentWords(prev => {
                const updated = [searchTerm, ...prev.filter(w => w !== searchTerm)].slice(0, 5);
                return updated;
            });

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to lookup word');
            setWordData(null);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    // Play pronunciation
    const playAudio = useCallback(() => {
        if (!wordData?.audio) return;

        const audio = new Audio(wordData.audio);
        audio.play().catch(() => { });
    }, [wordData]);

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchWord();
    };

    // Actions
    const actions: WidgetAction[] = wordData?.audio ? [
        {
            id: 'pronounce',
            icon: 'Volume2',
            label: 'Pronounce',
            onClick: playAudio,
        },
    ] : [];

    return (
        <WidgetWrapper
            id={id}
            title="Dictionary"
            icon="BookOpen"
            showHeader={showHeaders}
            actions={actions}
            isLoading={isLoading}
            contentClassName="p-3 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-3 overflow-hidden">
                {/* Search form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search word..."
                        className="h-8 text-sm flex-1"
                    />
                    <Button type="submit" size="sm" className="h-8 px-3" disabled={isLoading}>
                        <Search className="w-3 h-3" />
                    </Button>
                </form>

                {/* Results or empty state */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <AnimatePresence mode="wait">
                        {/* Error state */}
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex items-center justify-center text-center p-4"
                            >
                                <div>
                                    <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Word data */}
                        {wordData && !error && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {/* Word header */}
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground capitalize">
                                        {wordData.word}
                                    </h3>
                                    {wordData.phonetic && (
                                        <span className="text-sm text-muted-foreground">
                                            {wordData.phonetic}
                                        </span>
                                    )}
                                    {wordData.audio && (
                                        <button
                                            onClick={playAudio}
                                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label="Play pronunciation"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Meanings */}
                                <div className="space-y-3">
                                    {wordData.meanings.slice(0, 2).map((meaning, i) => (
                                        <div key={i} className="space-y-1">
                                            <span className="text-xs font-medium text-primary italic">
                                                {meaning.partOfSpeech}
                                            </span>
                                            {meaning.definitions.map((def, j) => (
                                                <div key={j} className="text-sm">
                                                    <p className="text-foreground">
                                                        {j + 1}. {def.definition}
                                                    </p>
                                                    {def.example && (
                                                        <p className="text-xs text-muted-foreground italic mt-0.5">
                                                            "{def.example}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Empty state with recent words */}
                        {!wordData && !error && !isLoading && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center"
                            >
                                <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground mb-3">
                                    Search for a word
                                </p>

                                {/* Recent words */}
                                {recentWords.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground/70">Recent:</p>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {recentWords.map((word) => (
                                                <button
                                                    key={word}
                                                    onClick={() => {
                                                        setQuery(word);
                                                        searchWord(word);
                                                    }}
                                                    className="px-2 py-0.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                                >
                                                    {word}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default DictionaryWidget;
