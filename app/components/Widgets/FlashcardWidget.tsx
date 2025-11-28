'use client';

import { useState, useEffect } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { ChevronLeft, ChevronRight, Shuffle, Edit2, Plus, Trash2, X, Save, RotateCw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardWidgetProps {
  id: string;
  settings?: {
    cards?: Flashcard[];
    currentIndex?: number;
  };
}

export default function FlashcardWidget({ id, settings }: FlashcardWidgetProps) {
  const { updateWidget } = useWidgets();
  const { data: session } = useSession();
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const [localFlashcards, setLocalFlashcards] = useLocalStorage<Flashcard[]>('flashcards_data', []);
  const cards: Flashcard[] = settings?.cards || [];
  const currentIndex = settings?.currentIndex || 0;

  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit mode state
  const [editedCards, setEditedCards] = useState<Flashcard[]>([]);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  // Load from DB or LocalStorage on mount/login
  useEffect(() => {
    const load = async () => {
      if (session?.user) {
        // Logged in: Load from DB
        try {
          const res = await fetch('/api/user/settings');
          if (!res.ok) return;
          const data = await res.json();
          
          let prefs = data.preferences;
          if (typeof prefs === 'string') {
             try { prefs = JSON.parse(prefs); } catch {}
          }
          
          if (prefs?.flashcards && Array.isArray(prefs.flashcards)) {
             if (prefs.flashcards.length > 0) {
               updateWidget(id, { settings: { ...settings, cards: prefs.flashcards } });
             }
          }
        } catch (e) {
          console.error('Failed to load flashcards from DB', e);
        }
      } else {
        // Not logged in: Load from LocalStorage
        // We restore from 'flashcards_data' if available and current widget is empty
        if (localFlashcards.length > 0 && cards.length === 0) {
           updateWidget(id, { settings: { ...settings, cards: localFlashcards } });
        }
      }
    };
    load();
  }, [session, id]); // Run on session change or id change. 
  // We exclude localFlashcards/cards/settings from deps to avoid loops, as we only want initial load.

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % cards.length;
      updateWidget(id, { settings: { ...settings, currentIndex: nextIndex } });
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateWidget(id, { settings: { ...settings, currentIndex: prevIndex } });
    }, 150);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setTimeout(() => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      updateWidget(id, { settings: { ...settings, cards: shuffled, currentIndex: 0 } });
    }, 150);
  };

  const startEditing = () => {
    setEditedCards([...cards]);
    setIsEditing(true);
    setIsFlipped(false);
  };

  const saveData = async (newCards: Flashcard[]) => {
    if (session?.user) {
      try {
        // Fetch current settings first to preserve other preferences
        const res = await fetch('/api/user/settings');
        const data = await res.json();
        
        let prefs = data.preferences;
        if (typeof prefs === 'string') {
           try { prefs = JSON.parse(prefs); } catch {}
        }
        if (!prefs || typeof prefs !== 'object') prefs = {};
        
        prefs.flashcards = newCards;
        
        await fetch('/api/user/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             theme: data.theme,
             pomodoroWork: data.pomodoroWork,
             pomodoroBreak: data.pomodoroBreak,
             preferences: prefs
          })
        });
      } catch (e) {
        console.error('Failed to save flashcards to DB', e);
      }
    } else {
      // Save to LocalStorage for guest users
      setLocalFlashcards(newCards);
    }
  };

  const saveEditing = () => {
    updateWidget(id, { settings: { ...settings, cards: editedCards, currentIndex: 0 } });
    saveData(editedCards);
    setIsEditing(false);
  };

  const addCard = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      question: newQ.trim(),
      answer: newA.trim()
    };
    setEditedCards([...editedCards, newCard]);
    setNewQ('');
    setNewA('');
  };

  const removeCard = (cardId: string) => {
    setEditedCards(editedCards.filter(c => c.id !== cardId));
  };

  const currentCard = cards[currentIndex];

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Book.json" fallbackIcon={BookOpen} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">
              {isEditing ? 'Edit Deck' : 'Flashcards'}
            </span>
            {!isEditing && cards.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({currentIndex + 1}/{cards.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleShuffle} title="Shuffle" disabled={cards.length === 0}>
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={startEditing} title="Edit Deck">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => setIsEditing(false)}>
                   <X className="w-4 h-4" />
                 </Button>
                 <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10" onClick={saveEditing}>
                   <Save className="w-4 h-4" />
                 </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div data-slot="content" className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col">
        {isEditing ? (
          <div className="flex flex-col h-full bg-background/50 backdrop-blur-md rounded-lg p-2">
            <div className="flex gap-2 mb-3">
              <Input 
                placeholder="Q" 
                value={newQ} 
                onChange={e => setNewQ(e.target.value)} 
                className="h-8 text-xs flex-1"
              />
              <Input 
                placeholder="A" 
                value={newA} 
                onChange={e => setNewA(e.target.value)} 
                className="h-8 text-xs flex-1"
              />
              <Button size="sm" onClick={addCard} className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {editedCards.map((card, i) => (
                <div key={card.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border text-xs">
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate" title={card.question}>Q: {card.question}</div>
                    <div className="text-muted-foreground truncate" title={card.answer}>A: {card.answer}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeCard(card.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {editedCards.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">No cards. Add one above!</div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col">
             {/* Card Area */}
             {cards.length > 0 ? (
                <div className="flex-1 flex items-center justify-center my-2 perspective-1000">
                  <div 
                    className={cn(
                      "relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer",
                      isFlipped ? "rotate-y-180" : ""
                    )}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                       <p className="font-medium text-lg leading-snug">{currentCard?.question}</p>
                       <span className="absolute bottom-3 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Question</span>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-secondary/50 flex items-center justify-center p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                       <p className="font-medium text-lg leading-snug">{currentCard?.answer}</p>
                       <span className="absolute bottom-3 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Answer</span>
                    </div>
                  </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-70">
                    <p className="text-sm font-medium mb-2">No flashcards yet</p>
                    <p className="text-xs text-muted-foreground mb-4">Create your own deck to start studying.</p>
                    <Button size="sm" variant="outline" onClick={startEditing}>
                        Create Deck
                    </Button>
                </div>
             )}

            {/* Navigation */}
            {cards.length > 0 && (
                <div className="flex items-center justify-center gap-4 h-8 shrink-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-primary/10" 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={cards.length <= 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-[10px] text-muted-foreground">Tap card to flip</span>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-primary/10" 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={cards.length <= 1}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
