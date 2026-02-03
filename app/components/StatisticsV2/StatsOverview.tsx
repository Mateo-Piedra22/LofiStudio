/**
 * StatsOverview Component
 * Main statistics overview with key metrics
 */

'use client';

import { Clock, CheckCircle2, Flame, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { formatDuration } from '@/lib/types/statistics.types';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-2xl font-bold">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <p className={cn(
                                'text-xs font-medium',
                                trend.isPositive ? 'text-green-500' : 'text-red-500'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </p>
                        )}
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function StatsOverview() {
    const getTodaySessions = useStatisticsStore(s => s.getTodaySessions);
    const getThisWeekSessions = useStatisticsStore(s => s.getThisWeekSessions);
    const getSummary = useStatisticsStore(s => s.getSummary);

    const todaySessions = getTodaySessions().filter(s => s.mode === 'work');
    const weekSessions = getThisWeekSessions().filter(s => s.mode === 'work');
    const summary = getSummary();

    const todayWorkTime = todaySessions.reduce((acc, s) => acc + s.duration, 0);

    return (
        <div className="space-y-6">
            {/* Today's Stats */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Today</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatsCard
                        title="Sessions"
                        value={todaySessions.length}
                        icon={Calendar}
                        description="work sessions"
                    />
                    <StatsCard
                        title="Focus Time"
                        value={formatDuration(todayWorkTime)}
                        icon={Clock}
                    />
                    <StatsCard
                        title="This Week"
                        value={weekSessions.length}
                        icon={TrendingUp}
                        description="sessions"
                    />
                    <StatsCard
                        title="Streak"
                        value={`${summary.streak.current} days`}
                        icon={Flame}
                    />
                </div>
            </div>

            {/* All-time Stats */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">All Time</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <StatsCard
                        title="Total Sessions"
                        value={summary.totalSessions}
                        icon={CheckCircle2}
                        description={formatDuration(summary.totalWorkTime) + ' total'}
                    />
                    <StatsCard
                        title="Avg Per Day"
                        value={summary.averageSessionsPerDay}
                        icon={Target}
                        description="sessions"
                    />
                    <StatsCard
                        title="Best Streak"
                        value={`${summary.streak.longest} days`}
                        icon={Flame}
                    />
                </div>
            </div>

            {/* Insights */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        🕐 Most productive hour: <span className="text-foreground font-medium">
                            {summary.mostProductiveHour}:00
                        </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        📅 Most productive day: <span className="text-foreground font-medium">
                            {summary.mostProductiveDay}
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
