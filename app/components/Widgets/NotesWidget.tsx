'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export default function NotesWidget() {
  const [notes, setNotes] = useLocalStorage('quickNotes', '');
  const [tempNotes, setTempNotes] = useState(notes);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setNotes(tempNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <AnimatedIcon name="FileText" className="w-5 h-5" />
            Quick Notes
          </span>
          <Button
            onClick={handleSave}
            size="sm"
            variant="ghost"
            className="h-8 hover:bg-accent/10"
            disabled={saved}
          >
            <AnimatedIcon name="Save" className="w-4 h-4 mr-1" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <textarea
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          placeholder="Jot down your thoughts..."
          className="w-full h-full min-h-[160px] px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </CardContent>
    </Card>
  );
}
