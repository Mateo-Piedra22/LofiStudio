'use client';

import { useEffect, useMemo, useState } from 'react';
 
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock as ClockIcon, RefreshCw, Search, MapPin } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface Suggestion {
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  postcodes?: string[];
  lat: number;
  lon: number;
}

export default function WorldTimeWidget() {
  const [timeISO, setTimeISO] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useLocalStorage<{ display: string; lat: number; lon: number; timezone?: string } | null>('worldTimeLocation', null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [tz, setTz] = useState<string>('');
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

  const formatted = useMemo(() => {
    try {
      if (!tz) return '';
      return new Intl.DateTimeFormat(undefined, { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
    } catch { return ''; }
  }, [tz]);

  const fetchTime = async (loc?: { display?: string; lat: number; lon: number }) => {
    setLoading(true);
    try {
      const target = loc || location || null;
      if (!target) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const tzResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`);
            const tzJson = await tzResp.json();
            const tzName = tzJson?.timezone || '';
            setTz(tzName);
            const w = await fetch(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(tzName)}`);
            const wj = await w.json();
            const dt = wj?.datetime || '';
            setTimeISO(dt);
            setLocation({ display: tzJson?.timezone, lat: latitude, lon: longitude, timezone: tzName });
          });
        }
        return;
      }
      const tzResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&timezone=auto`);
      const tzJson = await tzResp.json();
      const tzName = tzJson?.timezone || '';
      setTz(tzName);
      const w = await fetch(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(tzName)}`);
      const wj = await w.json();
      const dt = wj?.datetime || '';
      setTimeISO(dt);
      const disp = loc?.display || location?.display || tzName;
      setLocation({ display: disp || tzName, lat: target.lat, lon: target.lon, timezone: tzName });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTime();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (tz) setTimeISO(new Date().toISOString());
    }, 1000);
    return () => clearInterval(id);
  }, [tz]);

  useEffect(() => {
    const q = input.trim();
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const id = setTimeout(async () => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=es&format=json`;
        const resp = await fetch(url);
        const data = await resp.json();
        const raw: any[] = (data?.results || []);
        const ql = q.toLowerCase();
        const filtered = raw.filter((r: any) => {
          const fields = [r.name, r.admin1, r.admin2, r.country].filter(Boolean).map((x: string) => x.toLowerCase());
          const zipList: string[] = Array.isArray(r.postcodes) ? r.postcodes : [];
          return fields.some((f: string) => f.includes(ql)) || zipList.some((z: string) => z.toLowerCase().includes(ql));
        });
        const list = filtered.map((r: any) => ({ name: r.name, admin1: r.admin1, admin2: r.admin2, country: r.country, country_code: r.country_code, postcodes: Array.isArray(r.postcodes) ? r.postcodes : undefined, lat: r.latitude, lon: r.longitude }));
        setSuggestions(list);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [input]);

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4">
      {showWidgetHeaders ? (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Clock.json" fallbackIcon={ClockIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground">World Time</span>
          </div>
          <div className="flex items-center space-x-2">
            {showSearchBar && (
              <div className="relative no-drag">
                <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search location..."
                    className={`w-[140px] md:w-[216px] px-3 py-1.5 rounded-lg bg-background/50 border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                    aria-label="Search location"
                  />
                </form>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-56 overflow-y-auto">
                    {suggestions.map((s, i) => {
                      const cp = s.postcodes?.[0];
                      const display = `${s.name}${s.admin1 ? ', ' + s.admin1 : ''}${s.admin2 ? ', ' + s.admin2 : ''}${s.country ? ', ' + s.country : ''}${cp ? ' (CP: ' + cp + ')' : ''}`;
                      return (
                        <button
                          key={`${s.name}-${s.lat}-${s.lon}-${i}`}
                          onClick={() => { setInput(''); setShowSuggestions(false); setShowSearchBar(false); fetchTime({ display, lat: s.lat, lon: s.lon }); }}
                          className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm text-foreground border-b border-border last:border-0"
                          aria-label={`Select ${display}`}
                        >
                          {display}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <Button
              onClick={() => fetchTime()}
              size="icon"
              variant="ghost"
              disabled={loading}
              className="h-8 w-8 hover:bg-accent/10"
              title="Refresh Time"
              aria-label="Refresh Time"
            >
              <AnimatedIcon animationSrc="/lottie/RefreshCw.json" fallbackIcon={RefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowSearchBar((v) => !v)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-accent/10"
              title="Search"
              aria-label="Search"
            >
              <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : null}
      <div data-slot="content" className={`flex-1 min-h-0 h-full w-full flex p-4 ${showWidgetHeaders ? 'items-center justify-start' : 'items-center justify-start'} overflow-hidden`}>
        {timeISO ? (
          <div className={`w-full flex ${showWidgetHeaders ? 'items-center justify-start' : 'items-center justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-5xl md:text-6xl font-bold text-foreground leading-none tracking-tighter`}>{formatted}</p>
                <p className="mt-2 text-muted-foreground text-xs inline-flex items-center gap-1">
                  <AnimatedIcon animationSrc="/lottie/MapPin.json" fallbackIcon={MapPin} className="w-3 h-3" />
                  {location?.display || tz}
                </p>
              </div>
              <div className="drop-shadow-lg">
                <AnimatedIcon animationSrc="/lottie/Clock.json" fallbackIcon={ClockIcon} className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <AnimatedIcon animationSrc="/lottie/Clock.json" fallbackIcon={ClockIcon} className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Select a location to view its local time</p>
          </div>
        )}
      </div>
    </div>
  );
}
