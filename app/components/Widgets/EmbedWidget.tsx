'use client';

import { useState } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { Link2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EmbedWidgetProps {
  id: string;
  settings?: {
    embedUrl?: string;
  };
}

export default function EmbedWidget({ id, settings }: EmbedWidgetProps) {
  const { updateWidget } = useWidgets();
  const embedUrl = settings?.embedUrl || '';
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

  const processUrl = (url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl) return '';

    // Basic protocol check
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      const urlObj = new URL(finalUrl);
      const hostname = urlObj.hostname;

      // YouTube
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = '';
        if (hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.searchParams.has('v')) {
          videoId = urlObj.searchParams.get('v') || '';
        } else if (urlObj.pathname.includes('/embed/')) {
          return finalUrl; // Already embed
        }

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Spotify
      if (hostname.includes('spotify.com') && !urlObj.pathname.includes('/embed')) {
        // e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
        // needs -> https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT
        return `https://${hostname}/embed${urlObj.pathname}${urlObj.search}`;
      }

      // SoundCloud (usually needs iframe code, but url might work if they support oembed or similar, mostly they assume Embed API)
      // For generic URLs, we just return them and hope X-Frame-Options allows it.

      return finalUrl;
    } catch (e) {
      return '';
    }
  };

  const handleSave = () => {
    const processed = processUrl(inputUrl);
    if (!processed) {
      setError('Invalid URL');
      return;
    }
    setError('');
    updateWidget(id, { settings: { ...settings, embedUrl: processed } });
  };

  const clearEmbed = () => {
    updateWidget(id, { settings: { ...settings, embedUrl: '' } });
    setInputUrl('');
    setError('');
  };

  if (!embedUrl) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center relative">
        <div className="w-full max-w-xs space-y-4">
          <div className="flex flex-col items-center gap-2 text-muted-foreground mb-2">
             <Link2 className="w-8 h-8 opacity-50" />
             <h3 className="font-medium">Embed Content</h3>
             <p className="text-xs opacity-70">Paste a URL from Spotify, YouTube, or other embeddable sites.</p>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="sm" onClick={handleSave}>Embed</Button>
          </div>
          {error && <p className="text-xs text-destructive flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative group bg-black/5">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        loading="lazy"
      />
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
         <a 
           href={embedUrl} 
           target="_blank" 
           rel="noopener noreferrer"
           className="bg-background/80 backdrop-blur text-foreground p-1.5 rounded-md hover:bg-background shadow-sm"
           title="Open in new tab"
         >
           <ExternalLink className="w-3 h-3" />
         </a>
         <button 
           onClick={clearEmbed}
           className="bg-destructive/80 backdrop-blur text-destructive-foreground p-1.5 rounded-md hover:bg-destructive shadow-sm"
           title="Remove embed"
         >
           <Trash2 className="w-3 h-3" />
         </button>
      </div>
    </div>
  );
}
