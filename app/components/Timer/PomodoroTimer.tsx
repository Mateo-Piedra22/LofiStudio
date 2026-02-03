/**
 * PomodoroTimer V2
 * Refactored to use Zustand stores instead of legacy hooks
 */

'use client';

import { useEffect, useRef } from 'react';
import { useTimerStore, useTimerMode, useTimerActive } from '@/lib/stores/timer.store';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer as TimerIcon } from 'lucide-react';
import { Play, Pause, RotateCcw, Bell, BellOff, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PomodoroTimer() {
  const timerStore = useTimerStore();
  const settingsStore = useSettingsStore();

  const mode = useTimerMode();
  const isRunning = useTimerActive();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer interval
  useEffect(() => {
    if (timerStore.isActive && !timerStore.isPaused) {
      intervalRef.current = setInterval(() => {
        timerStore.tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerStore.isActive, timerStore.isPaused]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleModeSwitch = (newMode: 'work' | 'break') => {
    if (newMode === 'work') {
      timerStore.switchToWork();
    } else {
      timerStore.switchToBreak();
    }
  };

  const handleToggleNotifications = () => {
    settingsStore.setNotificationsEnabled(!settingsStore.settings.timer.notificationsEnabled);
  };

  const handlePlayPause = () => {
    if (!timerStore.isActive) {
      timerStore.start();
    } else if (timerStore.isPaused) {
      timerStore.resume();
    } else {
      timerStore.pause();
    }
  };

  const displayMode = mode === 'longBreak' ? 'break' : mode;
  const notificationsEnabled = settingsStore.settings.timer.notificationsEnabled;

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
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${displayMode === 'work' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Focus
              </button>
              <button
                onClick={() => handleModeSwitch('break')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${displayMode === 'break' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Break
              </button>
            </div>
            <Button
              onClick={() => timerStore.reset()}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => timerStore.skip()}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full"
              title="Skip to next session"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              onClick={handlePlayPause}
              className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg flex items-center justify-center"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button
              onClick={handleToggleNotifications}
              variant="ghost"
              size="icon"
              className={`rounded-full ${notificationsEnabled ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div
          className="flex flex-col items-center justify-center p-8 relative z-10 cursor-pointer"
          onClick={handlePlayPause}
        >
          <div className={`absolute inset-0 rounded-full blur-[100px] opacity-20 transition-all duration-1000 ${isRunning ? (displayMode === 'work' ? 'bg-primary' : 'bg-secondary') : 'bg-transparent'}`} />
          <div className="relative z-10 text-center">
            <motion.div
              key={timerStore.secondsRemaining}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 28, mass: 0.6 }}
              style={{ willChange: 'transform, opacity' }}
              className="text-[7.25rem] sm:text-[9.25rem] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 drop-shadow-2xl select-none"
            >
              {formatTime(timerStore.secondsRemaining)}
            </motion.div>
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase mt-2">
              {isRunning
                ? (displayMode === 'work' ? 'Focusing' : mode === 'longBreak' ? 'Long Break' : 'Resting')
                : timerStore.isPaused ? 'Paused' : 'Ready'}
            </p>
            {timerStore.sessionsCompleted > 0 && (
              <p className="text-muted-foreground/60 text-xs mt-1">
                {timerStore.sessionsCompleted} session{timerStore.sessionsCompleted !== 1 ? 's' : ''} completed
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
