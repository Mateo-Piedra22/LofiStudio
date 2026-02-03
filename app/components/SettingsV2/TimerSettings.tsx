/**
 * TimerSettings Component
 * Pomodoro timer configuration
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Timer, Coffee, Bell, BellOff, Volume2, VolumeX, Play } from 'lucide-react';
import { useSettingsStore, useTimerSettings } from '@/lib/stores/settings.store';

export function TimerSettingsPanel() {
    const timer = useTimerSettings();
    const store = useSettingsStore();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Timer Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Duration Settings */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="work-duration" className="text-xs text-muted-foreground">
                            Focus Duration (min)
                        </Label>
                        <Input
                            id="work-duration"
                            type="number"
                            min={1}
                            max={120}
                            value={timer.workDuration}
                            onChange={(e) => store.setWorkDuration(parseInt(e.target.value) || 25)}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="break-duration" className="text-xs text-muted-foreground">
                            Break Duration (min)
                        </Label>
                        <Input
                            id="break-duration"
                            type="number"
                            min={1}
                            max={60}
                            value={timer.breakDuration}
                            onChange={(e) => store.setBreakDuration(parseInt(e.target.value) || 5)}
                            className="h-9"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="long-break" className="text-xs text-muted-foreground">
                            Long Break (min)
                        </Label>
                        <Input
                            id="long-break"
                            type="number"
                            min={1}
                            max={60}
                            value={timer.longBreakDuration}
                            onChange={(e) => store.setLongBreakDuration(parseInt(e.target.value) || 15)}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sessions-count" className="text-xs text-muted-foreground">
                            Sessions Before Long Break
                        </Label>
                        <Input
                            id="sessions-count"
                            type="number"
                            min={1}
                            max={10}
                            value={timer.sessionsBeforeLongBreak}
                            onChange={(e) => store.setSessionsBeforeLongBreak(parseInt(e.target.value) || 4)}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Auto Start Options */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4" />
                            <Label htmlFor="auto-breaks" className="text-sm">
                                Auto-start Breaks
                            </Label>
                        </div>
                        <Switch
                            id="auto-breaks"
                            checked={timer.autoStartBreaks}
                            onCheckedChange={store.setAutoStartBreaks}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <Label htmlFor="auto-work" className="text-sm">
                                Auto-start Focus Sessions
                            </Label>
                        </div>
                        <Switch
                            id="auto-work"
                            checked={timer.autoStartWork}
                            onCheckedChange={store.setAutoStartWork}
                        />
                    </div>
                </div>

                {/* Notification Options */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {timer.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            <Label htmlFor="sound-enabled" className="text-sm">
                                Sound Alerts
                            </Label>
                        </div>
                        <Switch
                            id="sound-enabled"
                            checked={timer.soundEnabled}
                            onCheckedChange={store.setSoundEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {timer.notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                            <Label htmlFor="notifications-enabled" className="text-sm">
                                Browser Notifications
                            </Label>
                        </div>
                        <Switch
                            id="notifications-enabled"
                            checked={timer.notificationsEnabled}
                            onCheckedChange={store.setNotificationsEnabled}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
