'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useTaskManager } from '@/lib/hooks/useTaskManager';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, updateTask, completeTask } = useTaskManager();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthTasks = useMemo(() => {
    const start = startOfMonth(currentDate).getTime();
    const end = endOfMonth(currentDate).getTime();
    return tasks.filter(t => typeof (t as any).dueAt === 'number' && (t as any).dueAt >= start && (t as any).dueAt <= end);
  }, [tasks, currentDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    monthTasks.forEach(t => {
      const d = new Date((t as any).dueAt);
      const key = format(d, 'yyyy-MM-dd');
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    });
    return map;
  }, [monthTasks]);

  const openDay = (day: Date) => {
    setSelectedDay(day);
    setEditingId(null);
  };

  const closeDay = () => {
    setSelectedDay(null);
    setEditingId(null);
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description || '');
    const d = new Date((t as any).dueAt || new Date());
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setEditTime(`${hh}:${mm}`);
  };

  const saveEdit = (id: string) => {
    let dueAt: number | undefined = undefined;
    if (selectedDay) {
      const [h, m] = (editTime || '00:00').split(':').map(Number);
      const d = new Date(selectedDay);
      d.setHours(h || 0, m || 0, 0, 0);
      dueAt = d.getTime();
    }
    updateTask(id, { title: editTitle, description: editDescription || undefined, dueAt });
    setEditingId(null);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-normal mx-2 min-w-[100px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
              {day}
            </div>
          ))}
          {days.map((day) => (
            <button
              key={day.toString()}
              onClick={() => openDay(day)}
              className={`relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                isToday(day)
                  ? 'bg-primary text-primary-foreground font-bold'
                : isSameMonth(day, currentDate)
                  ? 'text-foreground hover:bg-accent/10'
                  : 'text-muted-foreground/50'
              }`}
            >
              {format(day, 'd')}
              {(() => {
                const key = format(day, 'yyyy-MM-dd')
                const list = tasksByDay.get(key) || []
                if (!list.length) return null
                const colors = Array.from(new Set(list.map((t: any) => t.color).filter(Boolean)))
                return (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {colors.slice(0, 4).map((c, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c as string }} />
                    ))}
                  </div>
                )
              })()}
            </button>
          ))}
        </div>
      </CardContent>
      <Dialog open={!!selectedDay} onOpenChange={(o) => !o && closeDay()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-foreground">Tasks for {selectedDay ? format(selectedDay, 'PPP') : ''}</span>
              <Button onClick={closeDay} variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(() => {
              const key = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : ''
              const list = (key && tasksByDay.get(key)) || []
              const sorted = [...list].sort((a: any, b: any) => ((b.dueAt || 0) - (a.dueAt || 0)))
              if (!sorted.length) {
                return <p className="text-sm text-muted-foreground">No tasks on this day.</p>
              }
              return (
                <div className="space-y-2">
                  {sorted.map((t: any) => (
                    <div key={t.id} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={!!t.completed} onCheckedChange={() => t.completed ? updateTask(t.id, { completed: false, completedAt: undefined }) : completeTask(t.id)} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          {editingId === t.id ? (
                            <div className="space-y-2">
                              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
                              <div className="flex items-center gap-2">
                                <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-32" />
                                <Button size="sm" onClick={() => saveEdit(t.id)}><Check className="w-4 h-4 mr-2" />Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-2" />Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">{t.title}</h4>
                                <div className="flex items-center gap-2">
                                  {t.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color as string }} />}
                                  <Button size="sm" variant="ghost" onClick={() => startEdit(t)}><Edit2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                              {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                              {typeof (t as any).dueAt === 'number' && <p className="text-xs text-muted-foreground mt-1">{format(new Date((t as any).dueAt), 'p')}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
