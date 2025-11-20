'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
      setError(null);
    } catch (error) {
      const errorMessage = `Failed to load ${key}`;
      console.error(`[v0] ${errorMessage}:`, error);
      setError(errorMessage);
      
      // Try to recover by clearing corrupted data
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        // Silent fail
      }
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const same = JSON.stringify(valueToStore) === JSON.stringify(storedValue);
      if (same) return;
      setStoredValue(valueToStore);
      
      // Auto-save with error handling
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setError(null);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('localstorage:update', { detail: { key, value: valueToStore } }));
        }, 0);
      } catch (storageError: any) {
        // Handle quota exceeded error
        if (storageError.name === 'QuotaExceededError') {
          setError('Storage quota exceeded. Some data may not be saved.');
          console.error('[v0] Storage quota exceeded');
        } else {
          setError('Failed to save data');
          console.error(`[v0] Error saving to localStorage:`, storageError);
        }
      }
    } catch (error) {
      setError('Failed to process data');
      console.error(`[v0] Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch {}
      }
    };

    const handleLocalUpdate = (e: any) => {
      if (e.detail && e.detail.key === key) {
        setStoredValue(e.detail.value as T);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('localstorage:update', handleLocalUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localstorage:update', handleLocalUpdate);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, isLoaded, error] as const;
}
