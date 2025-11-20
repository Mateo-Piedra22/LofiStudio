'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeSelector from './ThemeSelector';
import { X, Download, Upload, Trash2, AlertCircle, Video, Box, Palette, Image } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import FeedbackForm from '@/app/components/Settings/FeedbackForm';
import { useWidgets } from '@/lib/hooks/useWidgets';
import type { BackgroundConfig } from '@/app/components/Background';
import { Switch } from '@/components/ui/switch';
import variants from '@/lib/config/background-variants.json';
import loopsJson from '@/lib/config/background-loops.json';

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
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const ROOM_VARIANTS = (variants as any).room as Array<{ id: string; name: string }>;
  const CAFE_VARIANTS = (variants as any).cafe as Array<{ id: string; name: string }>;
  const [roomIdx, setRoomIdx] = useLocalStorage('roomVariantIndex', 0);
  const [cafeIdx, setCafeIdx] = useLocalStorage('cafeVariantIndex', 0);
  const LOOPS = (loopsJson as any).loops as Array<{ id: string; name: string }>;

  const applyGlass = (v: number) => {
    document.documentElement.style.setProperty('--glass-opacity', String(v));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
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
            <div className="p-4 rounded-lg glass border">
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
            </div>
          </div>

          {/* Background */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Background</h3>
            <div className="p-4 rounded-lg glass border space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Box className="w-4 h-4" /> Scenes</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={backgroundConfig.type === 'video' && ROOM_VARIANTS.some(v => v.id === backgroundConfig.videoId) ? 'default' : 'secondary'}
                    onClick={() => {
                      const next = (Number(roomIdx) + 1) % ROOM_VARIANTS.length;
                      setRoomIdx(next);
                      setBackgroundConfig({ type: 'video', videoId: ROOM_VARIANTS[next].id });
                    }}
                  >
                    Room
                  </Button>
                  <Button
                    variant={backgroundConfig.type === 'video' && CAFE_VARIANTS.some(v => v.id === backgroundConfig.videoId) ? 'default' : 'secondary'}
                    onClick={() => {
                      const next = (Number(cafeIdx) + 1) % CAFE_VARIANTS.length;
                      setCafeIdx(next);
                      setBackgroundConfig({ type: 'video', videoId: CAFE_VARIANTS[next].id });
                    }}
                  >
                    Cafe
                  </Button>
                  <Button variant={backgroundConfig.type === 'gradient' ? 'default' : 'secondary'} onClick={() => setBackgroundConfig({ type: 'gradient' })}>Gradient</Button>
                  <Button variant={backgroundConfig.type === 'video' ? 'default' : 'secondary'} onClick={() => setBackgroundConfig({ type: 'video', videoId: 'jfKfPfyJRdk' })}>Video</Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2"><Video className="w-4 h-4" /> Animated Loops</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  <Button onClick={() => setBackgroundConfig({ type: 'image', imageUrl: `https://source.unsplash.com/random/1920x1080/?${unsplashQuery || 'lofi,study'}` })} className="w-full" variant="secondary">Load Random Unsplash Image</Button>
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
                <Switch checked={googleCalendarEnabled} onCheckedChange={(v) => setGoogleCalendarEnabled(!!v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Google Tasks</p>
                  <p className="text-xs text-muted-foreground">Sync tasks with Google Tasks. Requires re-login.</p>
                </div>
                <Switch checked={googleTasksEnabled} onCheckedChange={(v) => setGoogleTasksEnabled(!!v)} />
              </div>
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

          

          {/* Feedback Section */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Feedback</h3>
            <FeedbackForm />
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
