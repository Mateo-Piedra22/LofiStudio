'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock as ClockIcon } from 'lucide-react'
import { format } from 'date-fns';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [format24h, setFormat24h] = useLocalStorage('clockFormat24h', true);
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

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
      {showWidgetHeaders ? (
        <CardHeader className="h-11 p-3">
          <CardTitle className="flex items-center justify-start text-foreground">
            <span className="flex items-center gap-2">
              <AnimatedIcon animationSrc="/lottie/Clock.json" fallbackIcon={ClockIcon} className="w-5 h-5" />
              Clock
            </span>
            <button
              onClick={() => setFormat24h(!format24h)}
              className="ml-auto py-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-all"
            >
              {format24h ? '24h' : '12h'}
            </button>
          </CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={`flex-1 ${showWidgetHeaders ? '' : 'h-full w-full'} flex items-center justify-center overflow-hidden`}>
        <div className="text-center space-y-3">
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
