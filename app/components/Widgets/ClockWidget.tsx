'use client';

import { useState, useEffect } from 'react';
 
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
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4">
      {showWidgetHeaders ? (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Clock.json" fallbackIcon={ClockIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">Clock</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFormat24h(!format24h)}
              className="py-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-all"
              aria-label="Toggle time format"
            >
              {format24h ? '24h' : '12h'}
            </button>
          </div>
        </div>
      ) : null}
      <div data-slot="content" className={`flex-1 min-h-0 h-full w-full flex items-center justify-center overflow-hidden p-4`}>
        <div className="text-center space-y-3">
          <p className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight leading-none">
            {format(time, timeFormat)}
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            {format(time, dateFormat)}
          </p>
        </div>
      </div>
    </div>
  );
}
