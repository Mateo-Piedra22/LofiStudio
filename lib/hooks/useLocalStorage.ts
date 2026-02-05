'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track the current value for event listeners
  // This avoids stale closure issues
  const currentValueRef = useRef<T>(initialValue);
  currentValueRef.current = storedValue;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
        currentValueRef.current = parsed;
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
      const valueToStore = value instanceof Function ? value(currentValueRef.current) : value;
      const same = JSON.stringify(valueToStore) === JSON.stringify(currentValueRef.current);
      if (same) return;

      setStoredValue(valueToStore);
      currentValueRef.current = valueToStore;

      // Auto-save with error handling
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setError(null);
        // Don't dispatch custom event - it causes circular updates
        // Other tabs will get notified via the native 'storage' event
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
  }, [key]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          // Only update if different from current value
          if (JSON.stringify(newValue) !== JSON.stringify(currentValueRef.current)) {
            setStoredValue(newValue);
            currentValueRef.current = newValue;
          }
        } catch { }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  return [storedValue, setValue, isLoaded, error] as const;
}
