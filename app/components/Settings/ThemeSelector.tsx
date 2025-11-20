'use client';

import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSelectorProps {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export default function ThemeSelector({ theme, setTheme }: ThemeSelectorProps) {
  const themes: Array<{ value: 'light' | 'dark' | 'auto'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-5 h-5" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Dark' },
    { value: 'auto', icon: <Monitor className="w-5 h-5" />, label: 'Auto' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
            theme === t.value
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-accent'
          }`}
        >
          {t.icon}
          <span className="text-foreground text-sm">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
