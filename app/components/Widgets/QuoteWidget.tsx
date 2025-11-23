'use client';

import { useState, useEffect } from 'react';
 
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import quotesData from '@/lib/config/quotes.json';
import tagMapJson from '@/lib/config/quote-tags.json';

type Language = 'en' | 'es';

const QUOTES_BY_CATEGORY = (quotesData as any).languages as Record<Language, Record<string, { text: string; author: string }[]>>

interface QuoteWidgetProps {
  category?: 'motivation' | 'peace' | 'focus';
}

export default function QuoteWidget({ category = 'motivation' }: QuoteWidgetProps) {
  const [currentCategory, setCurrentCategory] = useLocalStorage('quoteCategory', category);
  const [language, setLanguage] = useLocalStorage<Language>('quoteLanguage', 'en');
  const [quote, setQuote] = useState(QUOTES_BY_CATEGORY[language][currentCategory]?.[0] || QUOTES_BY_CATEGORY['en']['motivation'][0]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

  const tagMap: Record<string, string> = (tagMapJson as any).tags;

  const getLocalFallback = (lang: Language, cat: string) => {
    const list = QUOTES_BY_CATEGORY[lang]?.[cat] || QUOTES_BY_CATEGORY['en']?.['motivation'] || []
    if (list.length === 0) return { text: 'Keep going.', author: 'Unknown' }
    return list[Math.floor(Math.random() * list.length)]
  }

  const fetchQuote = async (cat: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quote?category=${encodeURIComponent(cat)}&lang=${encodeURIComponent(language)}`);
      const data = await res.json();
      if (data && data.text && data.author) {
        setQuote({ text: data.text, author: data.author });
        setSource(data.source === 'api' ? 'api' : 'local');
      } else {
        setQuote(getLocalFallback(language, cat));
        setSource('local');
      }
    } catch (e) {
      setQuote(getLocalFallback(language, cat));
      setSource('local');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(currentCategory);
  }, [currentCategory, language]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4">
      {showWidgetHeaders ? (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <AnimatedIcon animationSrc="/lottie/Quote.json" fallbackIcon={QuoteIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">{language === 'en' ? 'Daily Quote' : 'Cita Diaria'}</span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap justify-end">
            <span className={`px-2 py-1 rounded-full text-[10px] ${source === 'api' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {source === 'api' ? (language === 'en' ? 'Online' : 'En línea') : (language === 'en' ? 'Local' : 'Local')}
            </span>
            {(Object.keys(QUOTES_BY_CATEGORY['en'])).map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${currentCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent/10 text-muted-foreground hover:bg-accent/20'
                  }`}
                aria-label={`Select ${cat}`}
              >
                {cat}
              </button>
            ))}
            <Button
              onClick={toggleLanguage}
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-accent/10 text-xs font-bold"
              title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
              aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            >
              {language.toUpperCase()}
            </Button>
            <Button
              onClick={() => fetchQuote(currentCategory)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-accent/10"
              title="New Quote"
              aria-label="New Quote"
            >
              <AnimatedIcon animationSrc="/lottie/RefreshCw.json" fallbackIcon={RefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      ) : null}
      <div data-slot="content" className={`flex-1 min-h-0 h-full w-full flex items-center justify-start p-4`}>
        <div className="w-full flex flex-col justify-center space-y-2 overflow-hidden">
          <p className="text-foreground text-lg leading-snug italic line-clamp-4 text-left">"{quote.text}"</p>
          <p className="text-muted-foreground text-sm text-right">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
