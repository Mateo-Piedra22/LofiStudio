/**
 * ActivityChart Component V2
 * Bar chart showing daily activity
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { cn } from '@/lib/utils';

interface ActivityChartProps {
    days?: number;
    className?: string;
}

export function ActivityChart({ days = 7, className }: ActivityChartProps) {
    const getActivityChartData = useStatisticsStore(s => s.getActivityChartData);

    const data = useMemo(() => getActivityChartData(days), [getActivityChartData, days]);

    const maxValue = Math.max(...data.map(d => d.workSessions), 1);

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Week's Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-2 h-32">
                    {data.map((item, index) => {
                        const height = (item.workSessions / maxValue) * 100;
                        const isToday = index === data.length - 1;

                        return (
                            <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                                <div className="relative w-full flex items-end justify-center h-24">
                                    <div
                                        className={cn(
                                            'w-full max-w-8 rounded-t-md transition-all',
                                            isToday ? 'bg-primary' : 'bg-primary/40',
                                            item.workSessions === 0 && 'bg-muted'
                                        )}
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                    />
                                    {item.workSessions > 0 && (
                                        <span className="absolute -top-5 text-[10px] text-muted-foreground">
                                            {item.workSessions}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    'text-[10px]',
                                    isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                                )}>
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
