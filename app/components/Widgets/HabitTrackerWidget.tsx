'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Check, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
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
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const habits: Habit[] = settings?.habits || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = new Date();
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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#a78bfa', '#f472b6', '#34d399']
        });
      }
    }

    const newHabits = [...habits];
    newHabits[habitIndex] = { ...habit, completedDates: newCompletedDates };
    updateWidget(id, { settings: { ...settings, habits: newHabits } });
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-3">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Activity.json" fallbackIcon={Activity} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground/90">Habits</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div data-slot="content" className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1 custom-scrollbar">
        {isAdding && (
          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit..."
              className="h-9 text-xs bg-white/5 border-white/10 focus-visible:ring-white/20"
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              autoFocus
            />
            <Button size="sm" onClick={addHabit} className="h-9 px-3 bg-white/10 hover:bg-white/20 text-foreground">Add</Button>
          </div>
        )}

        {habits.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs text-center opacity-60 gap-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
               <Activity className="w-6 h-6 opacity-50" />
            </div>
            <p>No habits yet.</p>
          </div>
        )}

        {habits.map((habit) => (
          <div key={habit.id} className="group bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium truncate max-w-[140px] text-foreground/90 pl-1" title={habit.name}>
                {habit.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={() => deleteHabit(habit.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex justify-between gap-1.5">
              {days.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = habit.completedDates.includes(dateStr);
                const isToday = isSameDay(day, today);
                
                return (
                  <button
                    key={i}
                    onClick={() => toggleHabit(habit.id, day)}
                    className={cn(
                      "flex-1 aspect-square rounded-full flex items-center justify-center text-[9px] font-medium transition-all duration-300",
                      isCompleted 
                        ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-105" 
                        : "bg-transparent border border-white/10 text-muted-foreground hover:border-white/30",
                      isToday && !isCompleted && "border-primary/50 text-primary animate-pulse"
                    )}
                    title={format(day, 'MMM d')}
                  >
                    {isCompleted ? (
                       <Check className="w-3 h-3" /> 
                    ) : (
                       <span className="opacity-70">{format(day, 'EEEEE')}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
