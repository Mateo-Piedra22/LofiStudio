'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { MapPin, RefreshCw, Search, Droplets, Wind } from 'lucide-react'
import { CloudRain, Cloud, Snowflake, CloudFog, Zap, Sun } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
}

interface WeatherWidgetProps { compact?: boolean }

export default function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useLocalStorage('weatherCity', '');
  const [inputCity, setInputCity] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; admin1?: string; admin2?: string; country?: string; country_code?: string; postcodes?: string[]; lat: number; lon: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

  const fetchWeather = async (cityName?: string, coords?: { lat: number; lon: number }) => {
    setLoading(true);
    try {
      const targetCity = cityName || city;

      if (!targetCity) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `/api/weather/current?lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();

              if (!data.error) {
                setWeather(data);
                setCity(data.city);
              }
            },
            (error) => {
              console.error('[v0] Geolocation error:', error);
            }
          );
        }
        return;
      }

      const response = coords
        ? await fetch(`/api/weather/current?lat=${coords.lat}&lon=${coords.lon}`)
        : await fetch(`/api/weather/current?city=${encodeURIComponent(targetCity)}`);
      const data = await response.json();

      if (!data.error) {
        setWeather(data);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
      fetchWeather(inputCity.trim());
      setInputCity('');
      }
  };

  useEffect(() => {
    const q = inputCity.trim();
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
  }, [inputCity]);

  const getWeatherIcon = (icon: string) => {
    const size = compact ? 'w-6 h-6' : 'w-10 h-10';
    if (icon === 'rain' || icon.includes('rain')) return <AnimatedIcon animationSrc="/lottie/CloudRain.json" fallbackIcon={CloudRain} className={`${size} text-blue-400 motion-safe:animate-pulse`} />;
    if (icon === 'cloud' || icon.includes('cloud')) return <AnimatedIcon animationSrc="/lottie/Cloud.json" fallbackIcon={Cloud} className={`${size} text-gray-400`} />;
    if (icon === 'snow') return <AnimatedIcon animationSrc="/lottie/Snowflake.json" fallbackIcon={Snowflake} className={`${size} text-cyan-200 motion-safe:animate-pulse`} />;
    if (icon === 'fog') return <AnimatedIcon animationSrc="/lottie/CloudFog.json" fallbackIcon={CloudFog} className={`${size} text-gray-300`} />;
    if (icon === 'storm') return <AnimatedIcon animationSrc="/lottie/Zap.json" fallbackIcon={Zap} className={`${size} text-yellow-300`} />;
    return <AnimatedIcon animationSrc="/lottie/Sun.json" fallbackIcon={Sun} className={`${size} text-yellow-400 motion-safe:animate-pulse`} />;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders ? (
        <CardHeader className={compact ? 'h-11 p-2' : 'h-11 p-3'}>
          <CardTitle className="flex items-center justify-start text-foreground">
            <span className="flex items-center gap-2">
              <AnimatedIcon animationSrc="/lottie/MapPin.json" fallbackIcon={MapPin} className="w-5 h-5" />
              Weather
            </span>
            <div className="ml-auto flex items-center gap-2">
              {showSearchBar && (
                <div className="relative no-drag">
                  <form onSubmit={handleCitySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCity}
                      onChange={(e) => setInputCity(e.target.value)}
                      placeholder="Enter city..."
                      className={`${compact ? 'w-[120px] md:w-[180px]' : 'w-[140px] md:w-[216px]'} px-3 py-1.5 rounded-lg bg-background/50 border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                    />
                    <Button type="submit" size="sm" className="shrink-0 h-7 px-3">Set</Button>
                  </form>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-56 overflow-y-auto">
                      {suggestions.map((s, i) => {
                        const cp = s.postcodes?.[0];
                        const display = `${s.name}${s.admin1 ? ', ' + s.admin1 : ''}${s.admin2 ? ', ' + s.admin2 : ''}${s.country ? ', ' + s.country : ''}${cp ? ' (CP: ' + cp + ')' : ''}`;
                        return (
                          <button
                            key={`${s.name}-${s.lat}-${s.lon}-${i}`}
                            onClick={() => { setCity(display); setInputCity(''); setShowSuggestions(false); setShowSearchBar(false); fetchWeather(display, { lat: s.lat, lon: s.lon }); }}
                            className="w-full text-left px-3 py-2 hover:bg-accent/10 text-sm text-foreground border-b border-border last:border-0"
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
                onClick={() => fetchWeather()}
                size="icon"
                variant="ghost"
                disabled={loading}
                className="h-8 w-8 hover:bg-accent/10"
                title="Refresh Weather"
              >
                <AnimatedIcon animationSrc="/lottie/RefreshCw.json" fallbackIcon={RefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setShowSearchBar((v) => !v)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-accent/10"
                title="Search"
              >
                <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={`flex-1 ${showWidgetHeaders ? '' : 'h-full w-full'} flex flex-col ${compact ? 'space-y-2' : 'space-y-3'} items-center justify-center overflow-hidden`}>

        {weather ? (
          <div className="w-full space-y-4 mt-0.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className={`${compact ? 'text-2xl' : 'text-5xl md:text-6xl'} font-bold text-foreground leading-none tracking-tighter`}>{Math.round(weather.temp)}°</p>
                <p className={`${compact ? 'text-xs' : 'text-lg'} text-muted-foreground capitalize font-medium`}>{weather.description}</p>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <AnimatedIcon animationSrc="/lottie/MapPin.json" fallbackIcon={MapPin} className="w-3 h-3" />
                  {weather.city}
                </p>
              </div>
              <div className="drop-shadow-lg">
                {getWeatherIcon(weather.icon)}
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 ${compact ? 'pt-2' : 'pt-3'} border-t border-border ${compact ? 'place-items-center' : ''}`}>
              <div className={`flex items-center gap-2 ${compact ? 'p-1.5' : 'p-2.5'} rounded-xl bg-accent/10 border border-border`}>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <AnimatedIcon animationSrc="/lottie/Droplets.json" fallbackIcon={Droplets} className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Humidity</p>
                  <p className="text-foreground text-xs font-medium">{weather.humidity}%</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${compact ? 'p-1.5' : 'p-2.5'} rounded-xl bg-accent/10 border border-border`}>
                <div className="p-2 bg-gray-500/20 rounded-lg">
                  <AnimatedIcon animationSrc="/lottie/Wind.json" fallbackIcon={Wind} className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Wind</p>
                  <p className="text-foreground text-xs font-medium">{weather.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <AnimatedIcon animationSrc="/lottie/MapPin.json" fallbackIcon={MapPin} className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Enter your city to see the local weather forecast</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
