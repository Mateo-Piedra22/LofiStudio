/**
 * IntegrationSettings Component
 * Google Calendar and Tasks configuration
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckSquare, RefreshCw, LogIn, CheckCircle2 } from 'lucide-react';
import { useSettingsStore, useIntegrationSettings } from '@/lib/stores/settings.store';

interface CalendarOption {
    id: string;
    summary: string;
}

interface TaskListOption {
    id: string;
    title: string;
}

export function IntegrationSettings() {
    const { data: session } = useSession();
    const integrations = useIntegrationSettings();
    const store = useSettingsStore();

    const [calendars, setCalendars] = useState<CalendarOption[]>([]);
    const [taskLists, setTaskLists] = useState<TaskListOption[]>([]);
    const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
    const [isLoadingTaskLists, setIsLoadingTaskLists] = useState(false);

    // Fetch calendars when enabled
    useEffect(() => {
        if (integrations.googleCalendar.enabled && session) {
            fetchCalendars();
        }
    }, [integrations.googleCalendar.enabled, session]);

    // Fetch task lists when enabled
    useEffect(() => {
        if (integrations.googleTasks.enabled && session) {
            fetchTaskLists();
        }
    }, [integrations.googleTasks.enabled, session]);

    const fetchCalendars = async () => {
        setIsLoadingCalendars(true);
        try {
            const res = await fetch('/api/google/calendar/list');
            if (res.ok) {
                const data = await res.json();
                setCalendars(data.calendars || []);
            }
        } catch (err) {
            console.error('Failed to fetch calendars:', err);
        } finally {
            setIsLoadingCalendars(false);
        }
    };

    const fetchTaskLists = async () => {
        setIsLoadingTaskLists(true);
        try {
            const res = await fetch('/api/google/tasks/lists');
            if (res.ok) {
                const data = await res.json();
                setTaskLists(data.lists || []);
            }
        } catch (err) {
            console.error('Failed to fetch task lists:', err);
        } finally {
            setIsLoadingTaskLists(false);
        }
    };

    const handleCalendarToggle = (enabled: boolean) => {
        if (enabled && !session) {
            signIn('google', { callbackUrl: window.location.href });
            return;
        }
        store.setGoogleCalendarEnabled(enabled);
    };

    const handleTasksToggle = (enabled: boolean) => {
        if (enabled && !session) {
            signIn('google', { callbackUrl: window.location.href });
            return;
        }
        store.setGoogleTasksEnabled(enabled);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Google Account Status */}
                {!session && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">
                            Sign in to enable integrations
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => signIn('google')}
                            className="gap-2"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </Button>
                    </div>
                )}

                {/* Google Calendar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <Label className="text-sm font-medium">Google Calendar</Label>
                            {integrations.googleCalendar.enabled && session && (
                                <span className="flex items-center text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 font-medium">
                                    Connected <CheckCircle2 className="w-3 h-3 ml-1" />
                                </span>
                            )}
                        </div>
                        <Switch
                            checked={integrations.googleCalendar.enabled}
                            onCheckedChange={handleCalendarToggle}
                        />
                    </div>

                    {integrations.googleCalendar.enabled && session && (
                        <div className="space-y-3 pl-6">
                            <div className="flex items-center gap-2">
                                <Select
                                    value={integrations.googleCalendar.selectedCalendarId || ''}
                                    onValueChange={(v) => store.setGoogleCalendarId(v || null)}
                                >
                                    <SelectTrigger className="flex-1 h-9">
                                        <SelectValue placeholder="Select calendar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {calendars.map((cal) => (
                                            <SelectItem key={cal.id} value={cal.id}>
                                                {cal.summary}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={fetchCalendars}
                                    disabled={isLoadingCalendars}
                                    className="h-9 w-9"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoadingCalendars ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">
                                    Sync tasks to calendar
                                </Label>
                                <Switch
                                    checked={integrations.googleCalendar.syncTasks}
                                    onCheckedChange={store.setSyncTasks}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Google Tasks */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <Label className="text-sm font-medium">Google Tasks</Label>
                            {integrations.googleTasks.enabled && session && (
                                <span className="flex items-center text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 font-medium">
                                    Connected <CheckCircle2 className="w-3 h-3 ml-1" />
                                </span>
                            )}
                        </div>
                        <Switch
                            checked={integrations.googleTasks.enabled}
                            onCheckedChange={handleTasksToggle}
                        />
                    </div>

                    {integrations.googleTasks.enabled && session && (
                        <div className="pl-6">
                            <div className="flex items-center gap-2">
                                <Select
                                    value={integrations.googleTasks.selectedListId || ''}
                                    onValueChange={(v) => store.setGoogleTasksListId(v || null)}
                                >
                                    <SelectTrigger className="flex-1 h-9">
                                        <SelectValue placeholder="Select task list" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taskLists.map((list) => (
                                            <SelectItem key={list.id} value={list.id}>
                                                {list.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={fetchTaskLists}
                                    disabled={isLoadingTaskLists}
                                    className="h-9 w-9"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoadingTaskLists ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
