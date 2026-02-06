/**
 * QuoteWidget v2
 * Displays inspirational quotes with refresh functionality
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Quote as QuoteIcon } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface Quote {
    text: string;
    author: string;
}

// Curated local quotes for maximum reliability
const QUOTES: Quote[] = [
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
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
    { text: "Whatever you do, do it well.", author: "Walt Disney" },
    { text: "What we think, we become.", author: "Buddha" },
    { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Meaning is not found, it is built.", author: "Unknown" },
    { text: "Discipline is freedom.", author: "Jocko Willink" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
    { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Do not wait; the time will never be 'just right'.", author: "Napoleon Hill" },
    { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "If you're going through hell, keep going.", author: "Winston Churchill" },
    { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
    { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
    { text: "Impatience with actions, patience with results.", author: "Naval Ravikant" },
    { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek" },
    { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
    { text: "Identify the essential. Eliminate the rest.", author: "Leo Babauta" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "A ship in harbor is safe, but that is not what ships are built for.", author: "John A. Shedd" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "Get busy living or get busy dying.", author: "Stephen King" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The greater the difficulty, the more glory in surmounting it.", author: "Epicurus" },
    { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
    { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
    { text: "The power of imagination makes us infinite.", author: "John Muir" },
    { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
    { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
    { text: "Nothing is impossible, the word itself says 'I'm possible'!", author: "Audrey Hepburn" },
    { text: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" },
    { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
    { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "If you really look closely, most overnight successes took a long time.", author: "Steve Jobs" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
    { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
    { text: "If you do what you've always done, you'll get what you've always gotten.", author: "Tony Robbins" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "It is never too late to be what you might have been.", author: "George Eliot" },
    { text: "Knowledge is power.", author: "Francis Bacon" }
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
            // ─────────────────────────────────────────────────────────────────
            // Priority 1: DummyJSON API (High reliability)
            // ─────────────────────────────────────────────────────────────────
            try {
                const res = await fetch('https://dummyjson.com/quotes/random', {
                    signal: AbortSignal.timeout(3000)
                });
                if (res.ok) {
                    const data = await res.json();
                    // Maps { quote: "...", author: "..." }
                    if (data && data.quote && data.author) {
                        setQuote({ text: data.quote, author: data.author });
                        return; // Success!
                    }
                }
            } catch (apiError) {
                console.debug('[QuoteWidget] DummyJSON API unavailable, trying next source...', apiError);
            }

            // ─────────────────────────────────────────────────────────────────
            // Priority 2: Quotable API (User preferred, but often CORS/SSL blocked)
            // ─────────────────────────────────────────────────────────────────
            try {
                const res = await fetch('https://api.quotable.io/random', {
                    signal: AbortSignal.timeout(3000)
                });
                if (res.ok) {
                    const data = await res.json();
                    // Maps { content: "...", author: "..." }
                    if (data && data.content && data.author) {
                        setQuote({ text: data.content, author: data.author });
                        return; // Success!
                    }
                }
            } catch (apiError) {
                console.debug('[QuoteWidget] Quotable API unavailable.', apiError);
            }

            // ─────────────────────────────────────────────────────────────────
            // Fallback: Local Library (Guaranteed Success)
            // ─────────────────────────────────────────────────────────────────
            console.info('[QuoteWidget] Using local quote library fallback.');
            const randomIndex = Math.floor(Math.random() * QUOTES.length);
            setQuote(QUOTES[randomIndex]);

        } catch (criticalError) {
            // This should rarely happen given the structure above, but just in case
            console.error('[QuoteWidget] Critical failure:', criticalError);
            const randomIndex = Math.floor(Math.random() * QUOTES.length);
            setQuote(QUOTES[randomIndex]);
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
            allowAlignment={true}
            contentClassName="p-4"
        >
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 p-4 opacity-[0.03] pointer-events-none select-none">
                <QuoteIcon className="w-24 h-24 rotate-180" />
            </div>

            <AnimatePresence mode="wait">
                {quote && (
                    <motion.div
                        key={quote.text}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="space-y-4 relative z-10"
                    >
                        {/* Quote text */}
                        <p className="text-sm sm:text-base md:text-lg font-serif text-foreground/90 leading-relaxed italic tracking-wide drop-shadow-sm">
                            "{quote.text}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-primary/30" />
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                {quote.author}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </WidgetWrapper>
    );
}

export default QuoteWidget;
