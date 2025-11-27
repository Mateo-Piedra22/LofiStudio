'use client';

import { useState } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
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
    <div className="h-full w-full flex flex-col p-4 relative group/widget">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AnimatedIcon animationSrc="/lottie/Link.json" fallbackIcon={LinkIcon} className="w-5 h-5" />
          <span className="font-semibold text-sm">Quick Links</span>
        </div>
        {!isAdding && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
          <Input
            placeholder="URL (e.g., youtube.com)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-8 text-xs"
            autoFocus
          />
          <Input
            placeholder="Title (Optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 px-2 text-xs">Cancel</Button>
            <Button size="sm" onClick={addLink} className="h-7 px-2 text-xs">Add</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar p-1">
          {links.map((link) => (
            <div key={link.id} className="group relative flex flex-col items-center gap-1.5">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-muted/20 hover:bg-muted/40 border border-white/5 flex items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                title={link.title}
              >
                {!imgErrors[link.id] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getFaviconUrl(link.url)}
                    alt={link.title}
                    className="w-6 h-6 object-contain"
                    onError={() => setImgErrors(prev => ({ ...prev, [link.id]: true }))}
                  />
                ) : (
                  <Globe className="w-6 h-6 opacity-50" />
                )}
              </a>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center px-1">
                {link.title}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeLink(link.id);
                }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity scale-75 hover:scale-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {links.length === 0 && (
            <div className="col-span-4 flex flex-col items-center justify-center py-4 text-muted-foreground opacity-60 gap-2">
              <Globe className="w-8 h-8 opacity-20" />
              <span className="text-xs">Add your favorite sites</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
