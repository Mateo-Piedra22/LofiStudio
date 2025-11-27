'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Check, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgets } from '@/lib/hooks/useWidgets';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
}

interface HabitTrackerWidgetProps {
  id: string;
  settings?: {
    habits?: Habit[];
  };
}

export default function HabitTrackerWidget({ id, settings }: HabitTrackerWidgetProps) {
  const { updateWidget } = useWidgets();
  const habits: Habit[] = settings?.habits || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date();
  // Show last 7 days (including today)
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      completedDates: [],
    };
    updateWidget(id, { settings: { ...settings, habits: [...habits, newHabit] } });
    setNewHabitName('');
    setIsAdding(false);
  };

  const deleteHabit = (habitId: string) => {
    const newHabits = habits.filter((h) => h.id !== habitId);
    updateWidget(id, { settings: { ...settings, habits: newHabits } });
  };

  const toggleHabit = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const habitIndex = habits.findIndex((h) => h.id === habitId);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const isCompleted = habit.completedDates.includes(dateStr);
    
    let newCompletedDates;
    if (isCompleted) {
      newCompletedDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      newCompletedDates = [...habit.completedDates, dateStr];
      // Trigger confetti if it's today
      if (isSameDay(date, today)) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#a78bfa', '#f472b6', '#34d399'],
          disableForReducedMotion: true
        });
      }
    }

    const newHabits = [...habits];
    newHabits[habitIndex] = { ...habit, completedDates: newCompletedDates };
    updateWidget(id, { settings: { ...settings, habits: newHabits } });
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass-widget border text-card-foreground shadow-sm overflow-hidden p-4 relative group/widget">
       {/* Header */}
       <div data-slot="header" className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2 text-foreground/90">
             <div className="p-1.5 rounded-lg bg-primary/10">
                <AnimatedIcon animationSrc="/lottie/Activity.json" fallbackIcon={Activity} className="w-4 h-4 text-primary" />
             </div>
             <span className="font-semibold text-sm tracking-tight">Habits</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors rounded-full"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4" />
          </Button>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar space-y-3">
          {/* Add Form */}
          {isAdding && (
             <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <Input
                   value={newHabitName}
                   onChange={(e) => setNewHabitName(e.target.value)}
                   placeholder="New habit..."
                   className="h-8 text-xs bg-background/40 border-primary/20 focus-visible:ring-primary/30"
                   onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                   autoFocus
                />
                <Button size="sm" onClick={addHabit} className="h-8 px-3 text-xs bg-primary/90 hover:bg-primary">Add</Button>
             </div>
          )}

          {/* Empty State */}
          {habits.length === 0 && !isAdding && (
             <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground text-xs text-center opacity-60">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p>Track your daily habits</p>
             </div>
          )}

          {/* Habits List */}
          {habits.map((habit) => (
             <div key={habit.id} className="group/item relative bg-card/30 rounded-xl p-3 border border-border/40 hover:border-primary/20 transition-all duration-300 hover:bg-card/50">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-sm font-medium text-foreground/90 truncate max-w-[140px]" title={habit.name}>
                      {habit.name}
                   </span>
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1"
                      onClick={() => deleteHabit(habit.id)}
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                   {days.map((day, i) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = habit.completedDates.includes(dateStr);
                      const isToday = isSameDay(day, today);
                      
                      return (
                         <div key={i} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground/70 font-medium uppercase">{format(day, 'EEEEE')}</span>
                            <button
                               onClick={() => toggleHabit(habit.id, day)}
                               className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative",
                                  isCompleted 
                                     ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-100 hover:scale-105" 
                                     : "bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 scale-95 hover:scale-100",
                                  isToday && !isCompleted && "ring-2 ring-primary/40 ring-offset-2 ring-offset-transparent"
                               )}
                               title={format(day, 'MMM d')}
                            >
                               {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                         </div>
                      );
                   })}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
