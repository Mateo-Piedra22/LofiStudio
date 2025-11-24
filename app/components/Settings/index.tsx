'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeSelector from './ThemeSelector';
import { X, Download, Upload, Trash2, AlertCircle, Video, Box, Palette, Image, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import ReviewExperience from '@/app/components/Settings/ReviewExperience';
import { useWidgets } from '@/lib/hooks/useWidgets';
import type { BackgroundConfig } from '@/app/components/Background';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import variants from '@/lib/config/background-variants.json';
import loopsJson from '@/lib/config/background-loops.json';
import { useSession, signIn } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface SettingsProps {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  onClose: () => void;
}

export default function Settings({
  theme,
  setTheme,
  onClose,
}: SettingsProps) {
  const [workDuration, setWorkDuration] = useLocalStorage('pomodoroWork', 25);
  const [breakDuration, setBreakDuration] = useLocalStorage('pomodoroBreak', 5);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { widgets, toggleWidget, presets, lastPresetId } = useWidgets();
  const [backgroundConfig, setBackgroundConfig] = useLocalStorage<BackgroundConfig>('backgroundConfig', { type: 'gradient' });
  const defaultGlass = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 0.4 : 0.7;
  const [glassOpacity, setGlassOpacity] = useLocalStorage('glassOpacity', defaultGlass);
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useLocalStorage('googleCalendarEnabled', false);
  const [googleTasksEnabled, setGoogleTasksEnabled] = useLocalStorage('googleTasksEnabled', false);
  const [googleCalendarId, setGoogleCalendarId] = useLocalStorage('googleCalendarId', 'primary');
  const [googleTaskListId, setGoogleTaskListId] = useLocalStorage('googleTaskListId', '');
  const [availableCalendars, setAvailableCalendars] = useState<any[]>([]);
  const [availableTaskLists, setAvailableTaskLists] = useState<any[]>([]);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const ROOM_VARIANTS = (variants as any).room as Array<{ id: string; name: string }>;
  const CAFE_VARIANTS = (variants as any).cafe as Array<{ id: string; name: string }>;
  const [roomIdx, setRoomIdx] = useLocalStorage('roomVariantIndex', 0);
  const [cafeIdx, setCafeIdx] = useLocalStorage('cafeVariantIndex', 0);
  const LOOPS = (loopsJson as any).loops as Array<{ id: string; name: string }>;
  const roomTotal = ROOM_VARIANTS.length;
  const cafeTotal = CAFE_VARIANTS.length;
  const { status } = useSession();
  const { toast } = useToast();
  const handleToggleCalendar = (v: boolean) => {
    if (v) {
      if (status !== 'authenticated') {
        toast({ title: 'Inicia sesión para sincronizar con Google' });
        signIn('google', { callbackUrl: '/studio' });
        return;
      }
      setGoogleCalendarEnabled(true);
      return;
    }
    setGoogleCalendarEnabled(false);
  };
  const handleToggleTasks = (v: boolean) => {
    if (v) {
      if (status !== 'authenticated') {
        toast({ title: 'Inicia sesión para sincronizar con Google' });
        signIn('google', { callbackUrl: '/studio' });
        return;
      }
      setGoogleTasksEnabled(true);
      return;
    }
    setGoogleTasksEnabled(false);
  };

  const applyGlass = (v: number) => {
    const globalVal = Math.max(0.25, Math.min(1, v));
    const widgetVal = Math.max(0, Math.min(1, v));
    document.documentElement.style.setProperty('--glass-opacity', String(globalVal));
    document.documentElement.style.setProperty('--widget-glass-opacity', String(widgetVal));
  };

  if (typeof window !== 'undefined') {
    applyGlass(glassOpacity);
  }

  const handleExportData = () => {
    const data = {
      version: '1.0',
      theme,
      widgetVisibility: widgets.reduce((acc, widget) => ({ ...acc, [widget.type]: widget.enabled }), {}),
      tasks: localStorage.getItem('tasks'),
      taskLogs: localStorage.getItem('taskLogs'),
      pomodoroSessions: localStorage.getItem('pomodoroSessions'),
      pomodoroWork: localStorage.getItem('pomodoroWork'),
      pomodoroBreak: localStorage.getItem('pomodoroBreak'),
      playerVolume: localStorage.getItem('playerVolume'),
      currentVideo: localStorage.getItem('currentVideo'),
      playlist: localStorage.getItem('playlist'),
      currentPlaylistIndex: localStorage.getItem('currentPlaylistIndex'),
      playerRepeat: localStorage.getItem('playerRepeat'),
      playerShuffle: localStorage.getItem('playerShuffle'),
      backgroundType: localStorage.getItem('backgroundType'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lofistudio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!data.version) {
          alert('Invalid backup file format.');
          return;
        }

        Object.keys(data).forEach(key => {
          if (key !== 'exportDate' && key !== 'version' && data[key]) {
            localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
          }
        });

        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }

    const keysToKeep = ['theme', 'widgetVisibility'];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    alert('All data cleared! The page will refresh.');
    window.location.reload();
  };

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const res = await fetch('/api/google/calendar/list');
        if (!res.ok) return;
        const data = await res.json();
        setAvailableCalendars(data.calendars || []);
      } catch {}
    };
    if (googleCalendarEnabled && availableCalendars.length === 0) fetchCalendars();
  }, [googleCalendarEnabled]);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const res = await fetch('/api/google/tasks/lists');
        if (!res.ok) return;
        const data = await res.json();
        setAvailableTaskLists(data.lists || []);
      } catch {}
    };
    if (googleTasksEnabled && availableTaskLists.length === 0) fetchTaskLists();
  }, [googleTasksEnabled]);

  const handleWorkDurationChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 120) {
      setWorkDuration(num);
    }
  };

  const handleBreakDurationChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 60) {
      setBreakDuration(num);
    }
  };

  const [ts, setTs] = useState<number | null>(null);
  const [dy, setDy] = useState<number>(0);
  const [showWidgetHeaders, setShowWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
      onTouchStart={(e) => setTs(e.touches[0]?.clientY || 0)}
      onTouchMove={(e) => { if (ts == null) return; setDy((e.touches[0]?.clientY || 0) - ts); }}
      onTouchEnd={() => { if (dy > 80) onClose(); setTs(null); setDy(0); }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span>Settings</span>
            <Button onClick={onClose} size="icon" variant="ghost">
              <X className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Theme</h3>
            <ThemeSelector theme={theme} setTheme={setTheme} />
            <div className="mt-4 p-4 rounded-lg glass border">
              <label className="text-sm text-muted-foreground mb-2 block">Glass Intensity</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[glassOpacity]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(val: number[]) => {
                    const v = Math.max(0, Math.min(1, val[0]));
                    setGlassOpacity(v);
                    applyGlass(v);
                  }}
                />
                <span className="text-xs text-muted-foreground min-w-[3ch] text-right">{glassOpacity.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3">Pomodoro Timer</h3>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground text-sm mb-1 block">
                  Work Duration (minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={workDuration}
                  onChange={(e) => handleWorkDurationChange(e.target.value)}
                  className="bg-background/50 border-input text-foreground"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm mb-1 block">
                  Break Duration (minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => handleBreakDurationChange(e.target.value)}
                  className="bg-background/50 border-input text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Changes will apply to the next timer session
              </p>
            </div>
          </div>

          {/* Widget Visibility */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Widgets</h3>
            <div className="p-4 rounded-lg glass border space-y-4">
              <p className="text-muted-foreground text-sm mb-4">
                Manage your widgets, layouts, and presets in the dedicated Widget Manager.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new Event('open-widget-manager'));
                }}
                className="w-full"
                variant="secondary"
              >
                Open Widget Manager
              </Button>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm text-foreground">Show widget headers</p>
                  <p className="text-xs text-muted-foreground">Toggle titles and header controls in widgets.</p>
                </div>
                <Switch checked={!!showWidgetHeaders} onCheckedChange={(v) => setShowWidgetHeaders(!!v)} />
              </div>
            </div>
          </div>

          {/* Background */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Background</h3>
            <div className="p-4 rounded-lg glass border space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Video className="w-4 h-4" /> Scenes & Animated Loops</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[{ key: 'room', id: ROOM_VARIANTS[roomIdx].id, name: ROOM_VARIANTS[roomIdx].name, index: roomIdx, total: roomTotal }, { key: 'cafe', id: CAFE_VARIANTS[cafeIdx].id, name: CAFE_VARIANTS[cafeIdx].name, index: cafeIdx, total: cafeTotal }].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setBackgroundConfig({ type: 'video', videoId: item.id })}
                      className={`relative overflow-hidden rounded-lg border text-left aspect-video ${backgroundConfig.type === 'video' && backgroundConfig.videoId === item.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'}`}
                    >
                      <img src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-xs text-foreground">{`${item.key === 'room' ? 'Room' : 'Cafe'}: ${item.name} (${Number(item.index) + 1}/${item.total})`}</div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-background/70 border border-border text-muted-foreground">
                        <Repeat className="w-3 h-3" /> Loop Mode
                      </div>
                    </button>
                  ))}

                  {LOOPS.map((loop) => (
                    <button key={loop.id} onClick={() => setBackgroundConfig({ type: 'video', videoId: loop.id })} className={`relative overflow-hidden rounded-lg border text-left aspect-video ${backgroundConfig.type === 'video' && backgroundConfig.videoId === loop.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'}`}>
                      <img src={`https://img.youtube.com/vi/${loop.id}/mqdefault.jpg`} alt={loop.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-xs text-foreground">{loop.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Image className="w-4 h-4" /> Unsplash</h4>
                <div className="space-y-2">
                  <input type="text" placeholder="Search Unsplash (e.g., cozy room, rainy day)" className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm" onChange={(e) => setUnsplashQuery(e.target.value)} />
                  <Button onClick={() => setBackgroundConfig({ type: 'image', imageUrl: `https://source.unsplash.com/1920x1080/?${encodeURIComponent(unsplashQuery || 'lofi,study')}&sig=${Date.now()}` })} className="w-full" variant="secondary">Load Random Unsplash Image</Button>
                  <Button onClick={() => window.open('https://unsplash.com/wallpapers', '_blank', 'noopener')} className="w-full" variant="outline">Open Unsplash Wallpapers</Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Uploads</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Upload Image</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setBackgroundConfig({ type: 'image', imageUrl: url } as any);
                    }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Upload Video</label>
                    <input type="file" accept="video/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setBackgroundConfig({ type: 'video', videoUrl: url });
                    }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => window.dispatchEvent(new Event('open-background-selector'))}>Open Background Selector</Button>
                <Button variant="outline" onClick={() => {
                  const p = presets.find((x) => x.id === lastPresetId)
                  if (p?.background) setBackgroundConfig(p.background as any)
                }}>Apply Active Preset Background</Button>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Integrations</h3>
            <div className="p-4 rounded-lg glass border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Sync tasks to calendar. Requires re-login with permissions.</p>
                </div>
                <Switch checked={googleCalendarEnabled} onCheckedChange={(v) => handleToggleCalendar(!!v)} />
              </div>
              {googleCalendarEnabled && (
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Calendar</span>
                    <div className="flex-1">
                      <Select value={googleCalendarId} onValueChange={(v) => setGoogleCalendarId(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select calendar" />
                        </SelectTrigger>
                        <SelectContent>
                          {(availableCalendars.length ? availableCalendars : [{ id: 'primary', summary: 'Primary' }]).map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.summary}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Google Tasks</p>
                  <p className="text-xs text-muted-foreground">Sync tasks with Google Tasks. Requires re-login.</p>
                </div>
                <Switch checked={googleTasksEnabled} onCheckedChange={(v) => handleToggleTasks(!!v)} />
              </div>
              {googleTasksEnabled && (
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Task list</span>
                    <div className="flex-1">
                      <Select value={googleTaskListId} onValueChange={(v) => setGoogleTaskListId(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select task list" />
                        </SelectTrigger>
                        <SelectContent>
                          {(availableTaskLists.length ? availableTaskLists : []).map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">After enabling, sign out and sign in again. Reload to apply changes.</p>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Data Management</h3>
            <div className="space-y-2">
              <Button
                onClick={handleExportData}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="w-full"
                  variant="outline"
                  type="button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </label>

              <div className="pt-2 border-t border-border">
                {showClearConfirm && (
                  <div className="mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-destructive font-medium">
                          Are you sure?
                        </p>
                        <p className="text-xs text-destructive/80 mt-1">
                          This will permanently delete all tasks, sessions, and settings. This cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleClearAllData}
                      className="flex-1"
                      variant={showClearConfirm ? "destructive" : "outline"}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {showClearConfirm ? 'Confirm Clear All Data' : 'Clear All Data'}
                    </Button>
                    {showClearConfirm && (
                      <Button
                        onClick={() => setShowClearConfirm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          <div>
            <h3 className="text-foreground font-semibold mb-3">Tu experiencia</h3>
            <ReviewExperience />
          </div>

          {/* About */}
          <div className="pt-4 border-t border-border">
            <p className="text-muted-foreground text-xs text-center">
              LofiStudio v1.0 - A productivity app for focused work
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
