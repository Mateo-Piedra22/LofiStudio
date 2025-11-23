'use client';

import { useState } from 'react';
 
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { FileText, Save } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export default function NotesWidget() {
  const [notes, setNotes] = useLocalStorage('quickNotes', '');
  const [tempNotes, setTempNotes] = useState(notes);
  const [saved, setSaved] = useState(false);
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

  const handleSave = () => {
    setNotes(tempNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders ? (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/FileText.json" fallbackIcon={FileText} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">Quick Notes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              size="sm"
              variant="ghost"
              className="h-8 hover:bg-accent/10"
              disabled={saved}
              aria-label="Save notes"
            >
              <AnimatedIcon animationSrc="/lottie/Save.json" fallbackIcon={Save} className="w-4 h-4 mr-1" />
              {saved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>
      ) : null}
      <div data-slot="content" className={`flex-1 min-h-0 w-full flex items-center justify-start p-4`}>
        <textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          placeholder="Jot down your thoughts..."
          className="w-full h-full min-h-0 px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          aria-label="Notes"
        />
      </div>
    </div>
  );
}
