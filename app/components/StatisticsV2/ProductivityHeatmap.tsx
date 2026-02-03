/**
 * ProductivityHeatmap Component V2
 * GitHub-style contribution heatmap
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { cn } from '@/lib/utils';

interface ProductivityHeatmapProps {
    weeks?: number;
    className?: string;
}

const LEVEL_COLORS = [
    'bg-muted/30',      // 0 sessions
    'bg-green-200 dark:bg-green-900/50',
    'bg-green-300 dark:bg-green-700/60',
    'bg-green-400 dark:bg-green-600/70',
    'bg-green-500 dark:bg-green-500',
];

export function ProductivityHeatmap({ weeks = 12, className }: ProductivityHeatmapProps) {
    const getHeatmapData = useStatisticsStore(s => s.getHeatmapData);

    const cells = useMemo(() => getHeatmapData(weeks), [getHeatmapData, weeks]);

    // Group by weeks
    const weekGroups = useMemo(() => {
        const groups: typeof cells[] = [];
        for (let i = 0; i < cells.length; i += 7) {
            groups.push(cells.slice(i, i + 7));
        }
        return groups;
    }, [cells]);

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Productivity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {weekGroups.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                            {week.map((cell) => (
                                <div
                                    key={cell.date}
                                    className={cn(
                                        'w-3 h-3 rounded-sm transition-colors cursor-default',
                                        LEVEL_COLORS[cell.level]
                                    )}
                                    title={`${cell.date}: ${cell.value} sessions`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[10px] text-muted-foreground mr-1">Less</span>
                    {LEVEL_COLORS.map((color, i) => (
                        <div
                            key={i}
                            className={cn('w-3 h-3 rounded-sm', color)}
                        />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">More</span>
                </div>
            </CardContent>
        </Card>
    );
}
