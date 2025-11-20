'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PomodoroSession } from '@/lib/types';
import { format, startOfDay, subDays } from 'date-fns';

interface ProductivityHeatmapProps {
  sessions: PomodoroSession[];
}

export default function ProductivityHeatmap({ sessions }: ProductivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return {
        date: format(date, 'MMM dd'),
        timestamp: date.getTime(),
        count: 0,
      };
    });

    sessions.forEach(session => {
      if (session.mode === 'work') {
        const sessionDate = startOfDay(session.completedAt).getTime();
        const dayData = last30Days.find(day => day.timestamp === sessionDate);
        if (dayData) {
          dayData.count++;
        }
      }
    });

    const maxCount = Math.max(...last30Days.map(d => d.count), 1);

    return last30Days.map(day => ({
      ...day,
      intensity: day.count / maxCount,
    }));
  }, [sessions]);

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255,255,255,0.1)';
    if (intensity < 0.25) return 'rgba(59,130,246,0.3)';
    if (intensity < 0.5) return 'rgba(59,130,246,0.5)';
    if (intensity < 0.75) return 'rgba(59,130,246,0.7)';
    return 'rgba(59,130,246,1)';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Productivity Heatmap (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-1">
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm transition-all hover:scale-110"
              style={{ backgroundColor: getColor(day.intensity) }}
              title={`${day.date}: ${day.count} sessions`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
