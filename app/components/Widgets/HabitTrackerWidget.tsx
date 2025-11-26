'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Check, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgets } from '@/lib/hooks/useWidgets';
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
    <div className="h-full w-full flex flex-col p-4 overflow-hidden relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AnimatedIcon animationSrc="/lottie/Activity.json" fallbackIcon={Activity} className="w-5 h-5" />
          <span className="font-semibold text-sm">Habits</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1 custom-scrollbar">
        {isAdding && (
          <div className="flex gap-2 mb-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              autoFocus
            />
            <Button size="sm" onClick={addHabit} className="h-8 px-2">Add</Button>
          </div>
        )}

        {habits.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs text-center opacity-60">
            <p>No habits yet.</p>
            <p>Click + to start tracking.</p>
          </div>
        )}

        {habits.map((habit) => (
          <div key={habit.id} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium truncate max-w-[120px]" title={habit.name}>
                {habit.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                onClick={() => deleteHabit(habit.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex justify-between gap-1">
              {days.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = habit.completedDates.includes(dateStr);
                const isToday = isSameDay(day, today);
                
                return (
                  <button
                    key={i}
                    onClick={() => toggleHabit(habit.id, day)}
                    className={cn(
                      "flex-1 aspect-square rounded-full flex items-center justify-center text-[8px] transition-all duration-200 border",
                      isCompleted 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-muted/30 border-muted-foreground/20 hover:border-primary/50",
                      isToday && !isCompleted && "ring-1 ring-primary/30"
                    )}
                    title={format(day, 'MMM d')}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : format(day, 'EEEEE')}
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
