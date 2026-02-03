/**
 * QuoteWidget v2
 * Displays inspirational quotes with refresh functionality
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface Quote {
    text: string;
    author: string;
}

// Built-in quotes as fallback
const FALLBACK_QUOTES: Quote[] = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

interface QuoteWidgetProps {
    id: string;
    settings?: {
        category?: string;
        language?: string;
    };
}

/**
 * Quote widget with daily inspiration
 */
export function QuoteWidget({ id, settings }: QuoteWidgetProps) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Fetch a random quote
    const fetchQuote = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Try external API first
            const response = await fetch('https://api.quotable.io/random?tags=motivation|success|happiness', {
                signal: AbortSignal.timeout(3000),
            });

            if (response.ok) {
                const data = await response.json();
                setQuote({
                    text: data.content,
                    author: data.author,
                });
            } else {
                throw new Error('API failed');
            }
        } catch (e) {
            // Fallback to local quotes
            const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
            setQuote(FALLBACK_QUOTES[randomIndex]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'refresh',
            icon: 'RefreshCw',
            label: 'New quote',
            onClick: fetchQuote,
            disabled: isLoading,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Quote"
            icon="Quote"
            showHeader={showHeaders}
            actions={actions}
            isLoading={isLoading}
            error={error}
            onRefresh={fetchQuote}
            contentClassName="flex items-center justify-center p-4"
        >
            <AnimatePresence mode="wait">
                {quote && (
                    <motion.div
                        key={quote.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-center space-y-3"
                    >
                        {/* Quote text */}
                        <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
                            "{quote.text}"
                        </p>

                        {/* Author */}
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            — {quote.author}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </WidgetWrapper>
    );
}

export default QuoteWidget;
