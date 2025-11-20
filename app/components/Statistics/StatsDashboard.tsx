'use client';

import { useMemo } from 'react';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { useTaskManager } from '@/lib/hooks/useTaskManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from './StatsCard';
import ActivityChart from './ActivityChart';
import ProductivityHeatmap from './ProductivityHeatmap';
import { Clock, CheckCircle2, Flame, TrendingUp, Target, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StatsDashboard() {
  const { sessions, getStatistics } = useStatistics();
  const { tasks } = useTaskManager();

  const stats = useMemo(() => {
    const baseStats = getStatistics();
    const completedTasks = tasks.filter(t => t.completed);
    
    const todaySessions = sessions.filter(s => {
      const today = new Date().setHours(0, 0, 0, 0);
      return s.completedAt >= today && s.mode === 'work';
    });

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekSessions = sessions.filter(s => 
      s.completedAt >= thisWeekStart.getTime() && s.mode === 'work'
    );

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekSessions = sessions.filter(s => 
      s.completedAt >= lastWeekStart.getTime() && 
      s.completedAt < thisWeekStart.getTime() && 
      s.mode === 'work'
    );

    const weekTrend = lastWeekSessions.length > 0
      ? ((thisWeekSessions.length - lastWeekSessions.length) / lastWeekSessions.length) * 100
      : 0;

    return {
      ...baseStats,
      tasksCompleted: completedTasks.length,
      todaySessions: todaySessions.length,
      thisWeekSessions: thisWeekSessions.length,
      weekTrend,
    };
  }, [sessions, tasks, getStatistics]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const lastSession = sessions[0];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Sessions"
          value={stats.todaySessions}
          icon={Calendar}
          description="Work sessions completed today"
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeekSessions}
          icon={TrendingUp}
          description="Work sessions this week"
          trend={{
            value: Math.round(stats.weekTrend),
            isPositive: stats.weekTrend >= 0,
          }}
        />
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Clock}
          description={`${formatTime(stats.totalWorkTime)} work time`}
        />
        <StatsCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          icon={CheckCircle2}
          description="All-time completed tasks"
        />
        <StatsCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={Flame}
          description="Keep it up!"
        />
        <StatsCard
          title="Longest Streak"
          value={`${stats.longestStreak} days`}
          icon={Target}
          description="Your best performance"
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart sessions={sessions} />

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityHeatmap sessions={sessions} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Last Session</p>
                  <p className="text-xs text-muted-foreground">
                    {lastSession 
                      ? `${formatDistanceToNow(lastSession.completedAt, { addSuffix: true })}`
                      : 'No sessions yet'}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Total Focus Time</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(stats.totalWorkTime)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Break Time</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(stats.totalBreakTime)}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
