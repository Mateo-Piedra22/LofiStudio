'use client';
import { useMemo } from 'react';

import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, Plus, Target, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLogType } from '@/lib/types/statistics.types';

const getIconForType = (type: ActivityLogType) => {
    switch (type) {
        case 'session_start': return Clock;
        case 'session_end': return CheckCircle2;
        case 'task_complete': return Target;
        case 'task_create': return Plus;
        case 'note_added': return FileText;
        default: return FileText;
    }
};

const getColorForType = (type: ActivityLogType) => {
    switch (type) {
        case 'session_start': return 'text-blue-400 bg-blue-400/10';
        case 'session_end': return 'text-green-400 bg-green-400/10';
        case 'task_complete': return 'text-purple-400 bg-purple-400/10';
        case 'task_create': return 'text-orange-400 bg-orange-400/10';
        default: return 'text-gray-400 bg-gray-400/10';
    }
};

export function ActivityLogList() {
    const activityLog = useStatisticsStore(state => state.activityLog);
    const logs = useMemo(() => activityLog.slice(0, 50), [activityLog]);

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
                {logs.map((log) => {
                    const Icon = getIconForType(log.type);
                    const colorClass = getColorForType(log.type);

                    return (
                        <div key={log.id} className="flex gap-3 items-start group">
                            <div className={`p-2 rounded-lg shrink-0 ${colorClass} mt-0.5`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground leading-snug">
                                    {log.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    <span suppressHydrationWarning>
                                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                                    </span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
