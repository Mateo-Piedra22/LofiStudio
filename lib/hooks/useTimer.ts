'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsActive(false);
            setIsComplete(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsActive(false);
    setSeconds(newSeconds ?? initialSeconds);
    setIsComplete(false);
  }, [initialSeconds]);

  return { seconds, isActive, isComplete, start, pause, reset };
}
