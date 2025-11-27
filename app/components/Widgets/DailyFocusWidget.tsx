'use client';

import { useState, useEffect, useRef } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { Target, CheckCircle2, Pencil, Check } from 'lucide-react';
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
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass-widget border text-card-foreground shadow-sm overflow-hidden p-4 relative group/widget">
      {/* Header */}
      <div data-slot="header" className="flex items-center justify-between mb-4 shrink-0">
         <div className="flex items-center gap-2 text-foreground/90">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <AnimatedIcon animationSrc="/lottie/Target.json" fallbackIcon={Target} className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Daily Focus</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center">
          <label className="block text-center text-sm font-medium mb-3 text-muted-foreground">
            What is your main goal today?
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent border-b-2 border-primary/50 text-center text-xl font-semibold py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30 text-foreground"
            placeholder="Focus on..."
            onBlur={() => { if (inputValue.trim()) handleSubmit({ preventDefault: () => {} } as any); }}
          />
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 w-full px-2">
          <button
            onClick={toggleComplete}
            className={cn(
              "group relative flex items-center gap-3 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full p-3 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5",
              focusData.completed ? "text-muted-foreground" : "text-foreground"
            )}
          >
            <div className={cn(
              "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
              focusData.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 group-hover:border-primary"
            )}>
              {focusData.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className={cn(
              "text-center w-full truncate",
              focusData.completed && "line-through decoration-primary/50 decoration-2"
            )}>
              {focusData.text}
            </span>
            
            <div 
              onClick={(e) => { e.stopPropagation(); startEditing(); }}
              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-background/50 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </div>
          </button>
          
          {focusData.completed && (
            <p className="text-xs font-medium text-primary animate-bounce">
              Great job! 🎉
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
