'use client';

import { useState } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { Link2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AnimatedIcon from '@/app/components/ui/animated-icon';

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

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass-widget border text-card-foreground shadow-sm overflow-hidden relative group/widget">
      {/* Header */}
      <div data-slot="header" className="flex items-center justify-between p-2 shrink-0 bg-background/40 backdrop-blur-sm z-10 border-b border-border/10">
         <div className="flex items-center gap-2 text-foreground/90">
            <div className="p-1.5 rounded-lg bg-primary/10">
                <AnimatedIcon animationSrc="/lottie/Link.json" fallbackIcon={Link2} className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Embed</span>
         </div>
         {embedUrl && (
             <div className="flex gap-1 opacity-0 group-hover/widget:opacity-100 transition-opacity">
                <a 
                   href={embedUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-primary/10 transition-colors"
                   title="Open in new tab"
                 >
                   <ExternalLink className="w-3 h-3" />
                 </a>
                 <Button 
                   size="icon" 
                   variant="ghost" 
                   className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" 
                   onClick={clearEmbed}
                   title="Remove embed"
                 >
                   <Trash2 className="w-3 h-3" />
                 </Button>
             </div>
         )}
      </div>

      <div className="flex-1 w-full relative min-h-0 bg-background/20">
          {embedUrl ? (
             <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                loading="lazy"
              />
          ) : (
             <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-full max-w-xs space-y-4">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground mb-2">
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
          )}
      </div>
    </div>
  );
}
