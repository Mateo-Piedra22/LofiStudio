'use client';

import { useState, useEffect } from 'react';
import { useTimer } from '@/lib/hooks/useTimer';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer as TimerIcon } from 'lucide-react';
import { Play, Pause, RotateCcw, Coffee, Briefcase, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { VideoInfo } from '../Player';

type TimerMode = 'work' | 'break';

interface PomodoroTimerProps {
  currentVideo: VideoInfo | null;
}

export default function PomodoroTimer({ currentVideo }: PomodoroTimerProps) {
  const [workMinutes] = useLocalStorage('pomodoroWork', 25);
  const [breakMinutes] = useLocalStorage('pomodoroBreak', 5);
  const workDuration = Math.max(1, workMinutes) * 60;
  const breakDuration = Math.max(1, breakMinutes) * 60;
  const [mode, setMode] = useState<TimerMode>('work');
  const [sessionsCompleted, setSessionsCompleted] = useLocalStorage('pomodoroSessions', 0);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', true);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('soundEnabled', true);
  const { logSession } = useStatistics();

  const { seconds, isActive, isComplete, start, pause, reset } = useTimer(
    mode === 'work' ? workDuration : breakDuration
  );

  useEffect(() => {
    if ('Notification' in window && notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (isComplete) {
      showNotification();
      const duration = mode === 'work' ? workDuration : breakDuration;
      logSession(mode, duration);

      if (mode === 'work') {
        setSessionsCompleted((prev: number) => prev + 1);
        setMode('break');
        reset(breakDuration);
      } else {
        setMode('work');
        reset(workDuration);
      }
    }
  }, [isComplete, mode, breakDuration, workDuration, reset, setSessionsCompleted, logSession]);

  const showNotification = () => {
    const message = mode === 'work' ? 'Great work! Time for a break.' : 'Break is over. Ready to focus?';
    const title = mode === 'work' ? 'Work Session Complete' : 'Break Complete';

    if (soundEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8bllHAU2jdXy0n0vBSh+zPLaizsKGGS56uu0YRwFN5HY88p8MAcbPt4N');
        audio.volume = 0.5;
        audio.play().catch(() => { });
      } catch (e) { }
    }

    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          silent: !soundEnabled,
        });
        setTimeout(() => notification.close(), 5000);
      } catch (e) { }
    }
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    reset(newMode === 'work' ? workDuration : breakDuration);
  };

  const progress = ((mode === 'work' ? workDuration : breakDuration) - seconds) /
    (mode === 'work' ? workDuration : breakDuration) * 100;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5" />
            Timer
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1 rounded-full border border-border">
              <button
                onClick={() => handleModeSwitch('work')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'work' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Focus
              </button>
              <button
                onClick={() => handleModeSwitch('break')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'break' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Break
              </button>
            </div>
            <Button
              onClick={() => reset()}
              variant="ghost"
              size="icon"
              className="md:h-10 md:w-10 h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={isActive ? pause : start}
              className="md:h-9 md:w-9 h-11 w-11 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg flex items-center justify-center"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              variant="ghost"
              size="icon"
              className={`md:h-10 md:w-10 h-11 w-11 rounded-full ${notificationsEnabled ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="flex flex-col items-center justify-center p-8 relative z-10 cursor-pointer" onClick={() => { isActive ? pause() : start() }}>
          <div className={`absolute inset-0 rounded-full blur-[100px] opacity-20 transition-all duration-1000 ${isActive ? (mode === 'work' ? 'bg-primary' : 'bg-secondary') : 'bg-transparent'}`} />
          <div className="relative z-10 text-center">
            <motion.div
              key={seconds}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 28, mass: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
              className="text-[7.25rem] sm:text-[9.25rem] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 drop-shadow-2xl select-none"
            >
              {formatTime(seconds)}
            </motion.div>
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase mt-2">
              {isActive ? (mode === 'work' ? 'Focusing' : 'Resting') : 'Paused'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
