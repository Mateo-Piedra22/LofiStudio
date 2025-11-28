'use client';

import { useState } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Plus, Globe, X, ExternalLink, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { cn } from '@/lib/utils';

interface QuickLink {
  id: string;
  url: string;
  title: string;
}

interface QuickLinksWidgetProps {
  id: string;
  settings?: {
    links?: QuickLink[];
  };
}

export default function QuickLinksWidget({ id, settings }: QuickLinksWidgetProps) {
  const { updateWidget } = useWidgets();
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const links: QuickLink[] = settings?.links || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const addLink = () => {
    if (!newUrl.trim()) return;
    
    let processedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }

    const title = newTitle.trim() || new URL(processedUrl).hostname.replace('www.', '');

    const newLink: QuickLink = {
      id: crypto.randomUUID(),
      url: processedUrl,
      title: title,
    };

    updateWidget(id, { settings: { ...settings, links: [...links, newLink] } });
    setNewUrl('');
    setNewTitle('');
    setIsAdding(false);
  };

  const removeLink = (linkId: string) => {
    const newLinks = links.filter(l => l.id !== linkId);
    updateWidget(id, { settings: { ...settings, links: newLinks } });
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Link.json" fallbackIcon={LinkIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground/90">Quick Links</span>
          </div>
          {!isAdding && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <div data-slot="content" className="flex-1 w-full min-h-0 relative overflow-hidden flex flex-col justify-center">
        {isAdding ? (
          <div className="flex flex-col gap-3 animate-in fade-in zoom-in duration-200 bg-white/5 p-3 rounded-xl border border-white/5">
            <Input
              placeholder="URL (e.g., youtube.com)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="h-9 text-xs bg-white/5 border-white/10 focus-visible:ring-white/20"
              autoFocus
            />
            <Input
              placeholder="Title (Optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-9 text-xs bg-white/5 border-white/10 focus-visible:ring-white/20"
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
            />
            <div className="flex gap-2 justify-end mt-1">
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 px-3 text-xs hover:bg-white/10 rounded-lg">Cancel</Button>
              <Button size="sm" onClick={addLink} className="h-8 px-3 text-xs bg-white/10 hover:bg-white/20 text-foreground rounded-lg">Add</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 overflow-y-auto custom-scrollbar p-1 place-items-center content-center h-full">
            {links.map((link) => (
              <div key={link.id} className="group relative flex flex-col items-center gap-2 w-full">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                  title={link.title}
                >
                  {!imgErrors[link.id] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getFaviconUrl(link.url)}
                      alt={link.title}
                      className="w-7 h-7 object-contain drop-shadow-sm"
                      onError={() => setImgErrors(prev => ({ ...prev, [link.id]: true }))}
                    />
                  ) : (
                    <Globe className="w-7 h-7 opacity-60 text-foreground/80" />
                  )}
                </a>
                <span className="text-[10px] font-medium text-muted-foreground/80 truncate w-full text-center px-0.5 leading-tight group-hover:text-foreground transition-colors">
                  {link.title}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeLink(link.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 shadow-sm"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {links.length === 0 && (
              <div className="col-span-4 flex flex-col items-center justify-center py-4 text-muted-foreground opacity-60 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 border-dashed">
                    <Globe className="w-7 h-7 opacity-30" />
                </div>
                <span className="text-xs font-medium">Add your favorite sites</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
