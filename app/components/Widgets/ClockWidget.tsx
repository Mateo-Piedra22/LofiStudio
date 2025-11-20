'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [format24h, setFormat24h] = useLocalStorage('clockFormat24h', true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeFormat = format24h ? 'HH:mm:ss' : 'hh:mm:ss a';
  const dateFormat = 'EEEE, MMMM d, yyyy';

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Clock
          </span>
          <button
            onClick={() => setFormat24h(!format24h)}
            className="py-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-all"
          >
            {format24h ? '24h' : '12h'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight leading-none">
            {format(time, timeFormat)}
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            {format(time, dateFormat)}
          </p>
        </div>

        
      </CardContent>
    </Card>
  );
}
