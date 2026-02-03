/**
 * StatsWidget Component
 * Compact statistics widget for dashboard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Flame, Clock } from 'lucide-react';
import { useStatisticsStore, useTodaySessionCount, useStreak } from '@/lib/stores/statistics.store';
import { formatDuration } from '@/lib/types/statistics.types';
import { cn } from '@/lib/utils';

interface StatsWidgetProps {
    className?: string;
}

export function StatsWidget({ className }: StatsWidgetProps) {
    const todaySessions = useTodaySessionCount();
    const streak = useStreak();
    const getTodaySessions = useStatisticsStore(s => s.getTodaySessions);

    const todayWorkTime = getTodaySessions()
        .filter(s => s.mode === 'work')
        .reduce((acc, s) => acc + s.duration, 0);

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Today's Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Sessions */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessions</span>
                    <span className="text-lg font-bold">{todaySessions}</span>
                </div>

                {/* Focus time */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Focus Time
                    </span>
                    <span className="text-sm font-medium">{formatDuration(todayWorkTime)}</span>
                </div>

                {/* Streak */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Flame className={cn(
                            'h-3.5 w-3.5',
                            streak.current > 0 && 'text-orange-500'
                        )} />
                        Streak
                    </span>
                    <span className={cn(
                        'text-sm font-medium',
                        streak.current > 0 && 'text-orange-500'
                    )}>
                        {streak.current} days
                    </span>
                </div>

                {/* Visual bar for sessions */}
                <div className="pt-2">
                    <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex-1 h-2 rounded-full transition-colors',
                                    i < todaySessions ? 'bg-primary' : 'bg-muted'
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                        Goal: 8 sessions
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
