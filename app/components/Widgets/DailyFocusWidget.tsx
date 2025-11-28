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
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300 group">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Target.json" fallbackIcon={Target} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground/90">Daily Focus</span>
          </div>
          {!isEditing && focusData.text && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10" 
               onClick={startEditing}
             >
               <Pencil className="w-4 h-4 text-muted-foreground" />
             </Button>
          )}
        </div>
      )}

      <div data-slot="content" className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center">
            <label className="block text-center text-sm font-medium mb-4 text-muted-foreground/80 uppercase tracking-widest">
              What is your main goal?
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 text-center text-2xl font-light py-2 focus:outline-none focus:border-primary/70 transition-all placeholder:text-muted-foreground/20 text-foreground"
              placeholder="..."
            />
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <button
              onClick={toggleComplete}
              className="flex flex-col items-center gap-4 group/btn"
            >
              <div className={cn(
                "w-12 h-12 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-500",
                focusData.completed 
                  ? "bg-primary/90 border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-110" 
                  : "border-white/20 hover:border-primary/50 hover:bg-white/5"
              )}>
                {focusData.completed ? (
                   <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                ) : (
                   <div className="w-3 h-3 rounded-full bg-white/10 group-hover/btn:bg-primary/50 transition-colors" />
                )}
              </div>
              
              <span className={cn(
                "text-2xl md:text-3xl font-light text-center transition-all duration-500 px-4 leading-tight",
                focusData.completed 
                  ? "text-muted-foreground line-through decoration-primary/50 decoration-1 opacity-50 blur-[0.5px]" 
                  : "text-foreground/90"
              )}>
                {focusData.text}
              </span>
            </button>
            
            {focusData.completed && (
              <p className="text-xs font-medium text-primary/80 animate-pulse uppercase tracking-widest">
                Completed
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
