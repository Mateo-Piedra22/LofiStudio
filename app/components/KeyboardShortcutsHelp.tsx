'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    { keys: ['Space'], description: 'Play/Pause music' },
    { keys: ['Enter'], description: 'Start/Pause timer' },
    { keys: ['Ctrl', 'R'], description: 'Reset timer' },
    { keys: ['Ctrl', ','], description: 'Toggle settings' },
    { keys: ['Ctrl', 'S'], description: 'Toggle statistics' },
    { keys: ['Ctrl', 'L'], description: 'Toggle activity log' },
    { keys: ['Ctrl', 'K'], description: 'Focus music search' },
    { keys: ['Ctrl', 'N'], description: 'Create new task' },
    { keys: ['Shift', '?'], description: 'Show this help' },
    { keys: ['Esc'], description: 'Close modals' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </span>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={i}>
                      <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-secondary border border-border rounded shadow-sm">
                        {key}
                      </kbd>
                      {i < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-secondary border border-border rounded">Esc</kbd> to close any modal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
