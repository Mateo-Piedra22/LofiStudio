/**
 * FlashcardWidget v2
 * Study flashcards with spaced repetition hints
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Check, X, PenLine } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    correctCount: number;
    incorrectCount: number;
    lastReviewed?: string;
}

interface FlashcardDeck {
    id: string;
    name: string;
    cards: Flashcard[];
}

interface FlashcardWidgetProps {
    id: string;
    settings?: {
        autoFlip?: boolean;
    };
}

const STORAGE_KEY = 'lofi-flashcards-v2';

const DEFAULT_DECK: FlashcardDeck = {
    id: 'default',
    name: 'My Cards',
    cards: [
        { id: '1', front: 'What is the capital of France?', back: 'Paris', correctCount: 0, incorrectCount: 0 },
        { id: '2', front: 'What is 2 + 2?', back: '4', correctCount: 0, incorrectCount: 0 },
    ],
};

/**
 * Flashcard study widget
 */
export function FlashcardWidget({ id, settings }: FlashcardWidgetProps) {
    const [deck, setDeck] = useState<FlashcardDeck>(DEFAULT_DECK);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    const currentCard = deck.cards[currentIndex];

    // Load deck
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setDeck(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load flashcards:', e);
        }
    }, []);

    // Save deck
    const saveDeck = useCallback((newDeck: FlashcardDeck) => {
        setDeck(newDeck);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newDeck));
        }
    }, []);

    // Navigation
    const goToPrevious = useCallback(() => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : deck.cards.length - 1));
    }, [deck.cards.length]);

    const goToNext = useCallback(() => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev < deck.cards.length - 1 ? prev + 1 : 0));
    }, [deck.cards.length]);

    // Flip card
    const flipCard = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Shuffle deck
    const shuffleDeck = useCallback(() => {
        const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
        saveDeck({ ...deck, cards: shuffled });
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [deck, saveDeck]);

    // Mark correct/incorrect
    const markAnswer = useCallback((correct: boolean) => {
        if (!currentCard) return;

        const updatedCards = deck.cards.map(card =>
            card.id === currentCard.id
                ? {
                    ...card,
                    correctCount: correct ? card.correctCount + 1 : card.correctCount,
                    incorrectCount: correct ? card.incorrectCount : card.incorrectCount + 1,
                    lastReviewed: new Date().toISOString(),
                }
                : card
        );

        saveDeck({ ...deck, cards: updatedCards });
        goToNext();
    }, [currentCard, deck, saveDeck, goToNext]);

    // Add card
    const addCard = useCallback(() => {
        if (!newFront.trim() || !newBack.trim()) return;

        const card: Flashcard = {
            id: Date.now().toString(),
            front: newFront.trim(),
            back: newBack.trim(),
            correctCount: 0,
            incorrectCount: 0,
        };

        saveDeck({ ...deck, cards: [...deck.cards, card] });
        setNewFront('');
        setNewBack('');
        setIsAdding(false);
    }, [newFront, newBack, deck, saveDeck]);

    // Delete card
    const deleteCard = useCallback(() => {
        if (!currentCard) return;

        const updatedCards = deck.cards.filter(c => c.id !== currentCard.id);
        saveDeck({ ...deck, cards: updatedCards });

        if (currentIndex >= updatedCards.length) {
            setCurrentIndex(Math.max(0, updatedCards.length - 1));
        }
        setIsFlipped(false);
    }, [currentCard, deck, currentIndex, saveDeck]);

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'shuffle',
            icon: 'Shuffle',
            label: 'Shuffle',
            onClick: shuffleDeck,
            disabled: deck.cards.length < 2,
        },
        {
            id: 'add',
            icon: 'Plus',
            label: 'Add card',
            onClick: () => setIsAdding(true),
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Flashcards"
            icon="BookOpen"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2 overflow-hidden"
        >
            <div className="h-full flex flex-col gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* Add card form */}
                    {isAdding && (
                        <motion.div
                            key="add-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col gap-2"
                        >
                            <p className="text-xs text-muted-foreground">New Flashcard</p>
                            <Textarea
                                value={newFront}
                                onChange={(e) => setNewFront(e.target.value)}
                                placeholder="Front (question)"
                                className="flex-1 text-sm resize-none min-h-[60px]"
                            />
                            <Textarea
                                value={newBack}
                                onChange={(e) => setNewBack(e.target.value)}
                                placeholder="Back (answer)"
                                className="flex-1 text-sm resize-none min-h-[60px]"
                            />
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewFront('');
                                        setNewBack('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={addCard}
                                    disabled={!newFront.trim() || !newBack.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Card display */}
                    {!isAdding && deck.cards.length > 0 && currentCard && (
                        <motion.div
                            key="card-display"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col gap-2"
                        >
                            {/* Card */}
                            <motion.div
                                className="flex-1 relative cursor-pointer"
                                onClick={flipCard}
                                whileTap={{ scale: 0.98 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isFlipped ? 'back' : 'front'}
                                        initial={{ rotateY: 90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        exit={{ rotateY: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            'absolute inset-0 flex items-center justify-center p-4 rounded-lg',
                                            'text-center text-sm',
                                            isFlipped
                                                ? 'bg-primary/10 text-primary border-2 border-primary/30'
                                                : 'bg-muted/50 text-foreground border border-border'
                                        )}
                                    >
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {isFlipped ? 'Answer' : 'Question'}
                                            </p>
                                            <p className="font-medium">
                                                {isFlipped ? currentCard.back : currentCard.front}
                                            </p>
                                        </div>

                                        {/* Flip hint */}
                                        <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                                            Click to flip
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* Answer buttons (when flipped) */}
                            {isFlipped && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                                        onClick={() => markAnswer(false)}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Incorrect
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10"
                                        onClick={() => markAnswer(true)}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Correct
                                    </Button>
                                </motion.div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={goToPrevious}
                                    disabled={deck.cards.length <= 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="text-xs text-muted-foreground">
                                    {currentIndex + 1} / {deck.cards.length}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={deleteCard}
                                    >
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={goToNext}
                                        disabled={deck.cards.length <= 1}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                                <span className="text-green-500">✓ {currentCard.correctCount}</span>
                                <span className="text-red-500">✗ {currentCard.incorrectCount}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Empty state */}
                    {!isAdding && deck.cards.length === 0 && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center text-center"
                        >
                            <BookOpen className="w-10 h-10 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">
                                No flashcards yet
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Create your first card
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WidgetWrapper>
    );
}

export default FlashcardWidget;
