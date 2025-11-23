'use client';

import { useMemo, useState, useEffect } from 'react';
 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Edit2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useTaskManager } from '@/lib/hooks/useTaskManager';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useSession } from 'next-auth/react';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, updateTask, completeTask } = useTaskManager();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');
  const [googleCalendarEnabled] = useLocalStorage('googleCalendarEnabled', false);
  const [googleCalendarId] = useLocalStorage('googleCalendarId', 'primary');
  const { data: session } = useSession();
  const [eventsByDay, setEventsByDay] = useState<Map<string, any[]>>(new Map());
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [eventEditingId, setEventEditingId] = useState<string | null>(null);
  const [eventEditTitle, setEventEditTitle] = useState('');
  const [eventEditTime, setEventEditTime] = useState('');
  const [syncTaskToCalendarEnabled, setSyncTaskToCalendarEnabled] = useLocalStorage('syncTaskToCalendarEnabled', false);
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const refreshMonthEvents = () => {
    if (!googleCalendarEnabled) return;
    const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
    if (!hasScope) return;
    const timeMin = calendarStart.toISOString();
    const timeMax = calendarEnd.toISOString();
    const cal = googleCalendarId || 'primary';
    fetch(`/api/google/calendar/events?calendarId=${encodeURIComponent(cal)}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const map = new Map<string, any[]>();
        (data.events || []).forEach((e: any) => {
          const d = e.start ? new Date(e.start) : null;
          const key = d ? format(d, 'yyyy-MM-dd') : null;
          if (!key) return;
          const arr = map.get(key) || [];
          arr.push(e);
          map.set(key, arr);
        });
        setEventsByDay(map);
      })
      .catch(() => {});
  };

  useEffect(() => { refreshMonthEvents(); }, [googleCalendarEnabled, (session as any)?.accessToken, currentDate]);

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
    setTimeout(() => refreshMonthEvents(), 200);
  };

  const createEvent = async () => {
    if (!selectedDay || !newEventTitle) return;
    const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events');
    if (!googleCalendarEnabled || !hasScope) return;
    const [h, m] = (newEventTime || '00:00').split(':').map(Number);
    const start = new Date(selectedDay);
    start.setHours(h || 0, m || 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const res = await fetch('/api/google/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', summary: newEventTitle, start: start.getTime(), end: end.getTime() }) });
    if (!res.ok) return;
    const data = await res.json();
    const ev = data?.event;
    if (ev) {
      const key = format(start, 'yyyy-MM-dd');
      setEventsByDay(prev => {
        const map = new Map(prev);
        const arr = map.get(key) || [];
        arr.push({
          id: ev.id,
          summary: ev.summary,
          description: ev.description,
          start: start.getTime(),
          end: end.getTime(),
        });
        map.set(key, arr);
        return map;
      });
      setNewEventTitle('');
      setNewEventTime('');
    }
  };

  const startEditEvent = (e: any) => {
    setEventEditingId(e.id);
    setEventEditTitle(e.summary || 'Event');
    const d = e.start ? new Date(e.start) : new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setEventEditTime(`${hh}:${mm}`);
  };

  const saveEditEvent = async (id: string) => {
    const key = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
    if (!key) return;
    const [h, m] = (eventEditTime || '00:00').split(':').map(Number);
    const start = new Date(selectedDay as Date);
    start.setHours(h || 0, m || 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    await fetch('/api/google/calendar/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', id, summary: eventEditTitle, start: start.getTime(), end: end.getTime() }) });
    setEventsByDay(prev => {
      const map = new Map(prev);
      const arr = (map.get(key) || []).map((e: any) => e.id === id ? { ...e, summary: eventEditTitle, start: start.getTime(), end: end.getTime() } : e);
      map.set(key, arr);
      return map;
    });
    const linked = tasks.filter((t: any) => (t as any).externalCalendarId === id);
    linked.forEach((t: any) => updateTask(t.id, { title: eventEditTitle, dueAt: start.getTime() }));
    setEventEditingId(null);
  };

  const deleteEvent = async (id: string) => {
    const key = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
    if (!key) return;
    await fetch('/api/google/calendar/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calendarId: googleCalendarId || 'primary', id }) });
    setEventsByDay(prev => {
      const map = new Map(prev);
      const arr = (map.get(key) || []).filter((e: any) => e.id !== id);
      map.set(key, arr);
      return map;
    });
    const linked = tasks.filter((t: any) => (t as any).externalCalendarId === id);
    linked.forEach((t: any) => updateTask(t.id, { externalCalendarId: undefined, dueAt: undefined }));
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders ? (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Calendar.json" fallbackIcon={CalendarIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">Calendar</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label="Previous month"
            >
              <AnimatedIcon animationSrc="/lottie/ChevronLeft.json" fallbackIcon={ChevronLeft} className="w-4 h-4" />
            </button>
            <span className="text-sm font-normal mx-2 min-w-[100px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label="Next month"
            >
              <AnimatedIcon animationSrc="/lottie/ChevronRight.json" fallbackIcon={ChevronRight} className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
      <div data-slot="content" className={`flex-1 min-h-0 h-full w-full flex items-center justify-center p-4`}>
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
                const colorsFromTasks = Array.from(new Set(list.map((t: any) => t.color).filter(Boolean)))
                const ev = eventsByDay.get(key) || []
                const colorsFromEvents = ev.length ? ['#3b82f6'] : []
                const colors = Array.from(new Set([...(colorsFromTasks as any), ...colorsFromEvents]))
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
      </div>
      <Dialog open={!!selectedDay} onOpenChange={(o) => !o && closeDay()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-foreground">Tasks for {selectedDay ? format(selectedDay, 'PPP') : ''}</span>
              <Button onClick={closeDay} variant="ghost" size="icon"><AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4" /></Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(() => {
              const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events')
              if (!googleCalendarEnabled || !hasScope) return null
              return (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">Sync tasks with Google Calendar</span>
                  <Checkbox checked={!!syncTaskToCalendarEnabled} onCheckedChange={(v) => setSyncTaskToCalendarEnabled(!!v)} />
                </div>
              )
            })()}
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
                                <Button size="sm" onClick={() => saveEdit(t.id)}><AnimatedIcon animationSrc="/lottie/Check.json" fallbackIcon={Check} className="w-4 h-4 mr-2" />Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4 mr-2" />Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">{t.title}</h4>
                                <div className="flex items-center gap-2">
                                  {t.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color as string }} />}
                                  <Button size="sm" variant="ghost" onClick={() => startEdit(t)}><AnimatedIcon animationSrc="/lottie/Edit2.json" fallbackIcon={Edit2} className="w-4 h-4" /></Button>
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
            {(() => {
              const hasScope = (((session as any)?.scope as string | undefined)?.split(' ') || []).includes('https://www.googleapis.com/auth/calendar.events')
              if (!googleCalendarEnabled || !hasScope) return null
              const key = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : ''
              const ev = (key && eventsByDay.get(key)) || []
              const sortedEv = [...ev].sort((a: any, b: any) => ((a.start || 0) - (b.start || 0)))
              return (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Google Calendar</h4>
                  {sortedEv.map((e: any) => (
                    <div key={e.id} className="p-3 rounded-lg border border-border bg-card">
                      {eventEditingId === e.id ? (
                        <div className="space-y-2">
                          <Input value={eventEditTitle} onChange={(ev) => setEventEditTitle(ev.target.value)} />
                          <div className="flex items-center gap-2">
                            <Input type="time" value={eventEditTime} onChange={(ev) => setEventEditTime(ev.target.value)} className="w-32" />
                            <Button size="sm" onClick={() => saveEditEvent(e.id)}><AnimatedIcon animationSrc="/lottie/Check.json" fallbackIcon={Check} className="w-4 h-4 mr-2" />Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEventEditingId(null)}><AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4 mr-2" />Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground">{e.summary}</p>
                            {e.start && <p className="text-xs text-muted-foreground mt-1">{format(new Date(e.start), 'p')}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => startEditEvent(e)}><AnimatedIcon animationSrc="/lottie/Edit2.json" fallbackIcon={Edit2} className="w-4 h-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteEvent(e.id)}><AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <Input placeholder="New event" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
                      <Input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} className="w-32" />
                      <Button size="sm" onClick={createEvent}><AnimatedIcon animationSrc="/lottie/Check.json" fallbackIcon={Check} className="w-4 h-4 mr-2" />Create</Button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
