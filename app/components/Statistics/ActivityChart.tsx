'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PomodoroSession } from '@/lib/types';
import { format, startOfDay, subDays } from 'date-fns';

interface ActivityChartProps {
  sessions: PomodoroSession[];
}

export default function ActivityChart({ sessions }: ActivityChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        date: format(date, 'MMM dd'),
        timestamp: date.getTime(),
        work: 0,
        break: 0,
      };
    });

    sessions.forEach(session => {
      const sessionDate = startOfDay(session.completedAt).getTime();
      const dayData = last7Days.find(day => day.timestamp === sessionDate);
      if (dayData) {
        if (session.mode === 'work') {
          dayData.work += session.duration / 60; // Convert to minutes
        } else {
          dayData.break += session.duration / 60;
        }
      }
    });

    return last7Days;
  }, [sessions]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">Activity (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="work" fill="#3b82f6" name="Work Time" radius={[8, 8, 0, 0]} />
            <Bar dataKey="break" fill="#10b981" name="Break Time" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
