import { useEffect } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Predefined shortcuts
export const SHORTCUTS = {
  PLAY_PAUSE: { key: ' ', description: 'Play/Pause music' },
  START_TIMER: { key: 'Enter', description: 'Start/Pause timer' },
  RESET_TIMER: { key: 'r', ctrl: true, description: 'Reset timer' },
  TOGGLE_SETTINGS: { key: ',', ctrl: true, description: 'Toggle settings' },
  TOGGLE_STATS: { key: 's', ctrl: true, description: 'Toggle statistics' },
  TOGGLE_LOGS: { key: 'l', ctrl: true, description: 'Toggle activity log' },
  SEARCH_MUSIC: { key: 'k', ctrl: true, description: 'Focus search' },
  NEW_TASK: { key: 'n', ctrl: true, description: 'Create new task' },
  HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts' },
};
