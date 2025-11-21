'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import giphyConfig from '@/lib/config/giphy-categories.json';

const categories = (giphyConfig as any).categories as Array<{ id: string; label: string; tags: string[] }>;

export default function GifWidget() {
  const [gif, setGif] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>((categories[0]?.id) || 'lofi');
  const tagFor = (id: string) => {
    const cat = categories.find(c => c.id === id);
    const tags = cat?.tags || [id];
    // Alternate tags to avoid repeated random results and broaden matches
    const idx = Math.floor(Math.random() * tags.length);
    return tags[idx];
  };

  const fetchGif = async (cat: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/giphy/search?q=${encodeURIComponent(tagFor(cat))}`);
      const data = await response.json();
      
      if (!data.error && data.url) {
        setGif(data.url);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch GIF:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGif(category);
  }, [category]);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pt-2 pb-2">
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <AnimatedIcon name="Image" className="w-5 h-5" />
            Mood GIF
          </span>
          <div className="flex items-center gap-2 justify-end overflow-x-auto whitespace-nowrap no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                  category === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-accent/10 text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <Button
              onClick={() => fetchGif(category)}
              size="icon"
              variant="ghost"
              disabled={loading}
              className="h-8 w-8 hover:bg-accent/10"
              title="Get New GIF"
            >
              <AnimatedIcon name="RefreshCw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col space-y-2">

        {/* GIF Display */}
        <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden bg-secondary/50 border border-border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent/20 backdrop-blur-sm z-10">
              <AnimatedIcon name="RefreshCw" className="w-8 h-8 text-foreground animate-spin" />
            </div>
          )}
          {gif ? (
            <img 
              src={gif || "/placeholder.svg?height=320&width=480"} 
              alt={`${category} mood GIF`} 
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: loading ? 0.5 : 1 }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <AnimatedIcon name="Image" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Loading GIF...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
