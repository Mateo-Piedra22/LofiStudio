'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="h-full w-full flex flex-col rounded-xl overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders ? (
        <CardHeader className="h-11 px-2 py-1 flex items-center justify-between">
          <CardTitle className="flex items-center justify-start text-lg font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <AnimatedIcon animationSrc="/lottie/FileText.json" fallbackIcon={FileText} className="w-5 h-5" />
              Quick Notes
            </span>
          </CardTitle>
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
        </CardHeader>
      ) : null}
      <CardContent className={`flex-1 ${showWidgetHeaders ? '' : 'h-full w-full'} flex items-start justify-start p-4`}>
        <textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          placeholder="Jot down your thoughts..."
          className="w-full h-full min-h-[160px] px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          aria-label="Notes"
        />
      </CardContent>
    </Card>
  );
}
