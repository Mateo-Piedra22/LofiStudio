'use client';

import { useMemo } from 'react';
import { Clock, CheckCircle2, Flame, TrendingUp, Target, Calendar, BarChart3, History, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { formatDuration } from '@/lib/types/statistics.types';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ActivityLogList } from './ActivityLogList';
import { ProductivityHeatmap } from './ProductivityHeatmap';
import { useShallow } from 'zustand/react/shallow';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    delay?: number;
}

function StatsCard({ title, value, icon: Icon, description, trend, delay = 0 }: StatsCardProps) {
    return (
        <Card className="relative overflow-hidden border-white/5 bg-black/20 hover:bg-black/40 transition-all duration-300 group">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5 relative z-10">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {title}
                        </p>
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                            {value}
                        </p>
                        {description && (
                            <p className="text-xs text-muted-foreground/80 font-medium">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <p className={cn(
                                'text-xs font-bold mt-1',
                                trend.isPositive ? 'text-green-400' : 'text-red-400'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </p>
                        )}
                    </div>
                    <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            </CardContent>
        </Card>
    );
}

export function StatsOverview() {
    // Select raw state to prevent infinite loops from unstable derived selectors
    const { sessions, activityLog } = useStatisticsStore(
        useShallow(state => ({
            sessions: state.sessions,
            activityLog: state.activityLog
        }))
    );

    // Derived state - Computed in render to ensure stability
    const summary = useMemo(() => useStatisticsStore.getState().getSummary(), [sessions, activityLog]);

    const chartData = useMemo(() =>
        useStatisticsStore.getState().getActivityChartData(7),
        [sessions, activityLog]); // Re-compute when data changes

    const todayStats = useMemo(() =>
        useStatisticsStore.getState().getDailyStats(new Date()),
        [sessions, activityLog]);

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Today's Focus"
                    value={formatDuration(todayStats.totalWorkTime)}
                    icon={Brain}
                    description={`${todayStats.workSessions} sessions`}
                />
                <StatsCard
                    title="Current Streak"
                    value={`${summary.streak.current} Days`}
                    icon={Flame}
                    description={`Best: ${summary.streak.longest}`}
                />
                <StatsCard
                    title="Tasks Done"
                    value={todayStats.tasksCompleted}
                    icon={CheckCircle2}
                    description="Today"
                />
                <StatsCard
                    title="Total Hours"
                    value={Math.round(summary.totalWorkTime / 3600)}
                    icon={Clock}
                    description="All time focus"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="col-span-1 lg:col-span-2 border-white/5 bg-black/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Weekly Focus Distribution
                        </CardTitle>
                        <CardDescription>Daily work stats for the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="label"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${Math.round(val / 3600)}h`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`${formatDuration(value)}`, 'Focus Time']}
                                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                />
                                <Bar dataKey="workTime" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 6 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Activity Log */}
                <Card className="col-span-1 border-white/5 bg-black/20 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="w-5 h-5 text-primary" />
                            Activity Log
                        </CardTitle>
                        <CardDescription>Recent timeline events</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ActivityLogList />
                    </CardContent>
                </Card>
            </div>

            {/* Heatmap */}
            <ProductivityHeatmap weeks={20} className="border-white/5 bg-black/20" />

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-white/5 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Most Productive Time</p>
                            <p className="text-xl font-bold text-foreground">
                                {summary.mostProductiveHour}:00 - {summary.mostProductiveHour + 1}:00
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Best Day</p>
                            <p className="text-xl font-bold text-foreground">
                                {summary.mostProductiveDay}s
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
