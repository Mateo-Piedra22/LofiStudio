'use client';

import { useState, useEffect, useRef } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Target, CheckCircle2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Button } from '@/components/ui/button';

interface FocusState {
  text: string;
  completed: boolean;
  date: string; // ISO date
}

interface DailyFocusWidgetProps {
  id: string;
  settings?: {
    focus?: FocusState;
  };
}

export default function DailyFocusWidget({ id, settings }: DailyFocusWidgetProps) {
  const { updateWidget } = useWidgets();
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const savedFocus = settings?.focus;
  const isToday = savedFocus?.date === todayStr;
  
  const focusData = isToday && savedFocus 
    ? savedFocus 
    : { text: '', completed: false, date: todayStr };

  const [inputValue, setInputValue] = useState(focusData.text);
  const [isEditing, setIsEditing] = useState(!focusData.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newState = { text: inputValue.trim(), completed: false, date: todayStr };
    updateWidget(id, { settings: { ...settings, focus: newState } });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    const newState = { ...focusData, completed: !focusData.completed };
    updateWidget(id, { settings: { ...settings, focus: newState } });
    
    if (newState.completed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
    }
  };

  const startEditing = () => {
    setInputValue(focusData.text);
    setIsEditing(true);
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Target.json" fallbackIcon={Target} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">Daily Focus</span>
          </div>
          {!isEditing && focusData.text && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 w-8 p-0" 
               onClick={startEditing}
             >
               <Pencil className="w-4 h-4" />
             </Button>
          )}
        </div>
      )}

      <div data-slot="content" className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <label className="block text-center text-lg font-medium mb-3 text-muted-foreground">
              What is your main goal today?
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-transparent border-b-2 border-primary/50 text-center text-2xl font-semibold py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
              placeholder="Focus on..."
            />
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <button
              onClick={toggleComplete}
              className={cn(
                "flex items-center gap-3 text-2xl font-bold transition-all duration-300 hover:scale-105",
                focusData.completed ? "text-muted-foreground line-through decoration-primary decoration-2" : "text-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                focusData.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50 group-hover:border-primary"
              )}>
                {focusData.completed && <CheckCircle2 className="w-5 h-5" />}
              </div>
              {focusData.text}
            </button>
            
            {focusData.completed && (
              <p className="text-sm font-medium text-primary animate-bounce">
                Good job! 🎉
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
