'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Sun, Wind, Droplets, MapPin, RefreshCw, Snowflake, CloudFog, Zap } from 'lucide-react';
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

  const fetchWeather = async (cityName?: string) => {
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

      const response = await fetch(`/api/weather/current?city=${encodeURIComponent(targetCity)}`);
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

  const getWeatherIcon = (icon: string) => {
    const size = compact ? 'w-8 h-8' : 'w-10 h-10';
    if (icon === 'rain' || icon.includes('rain')) return <CloudRain className={`${size} text-blue-400`} />;
    if (icon === 'cloud' || icon.includes('cloud')) return <Cloud className={`${size} text-gray-400`} />;
    if (icon === 'snow') return <Snowflake className={`${size} text-cyan-200`} />;
    if (icon === 'fog') return <CloudFog className={`${size} text-gray-300`} />;
    if (icon === 'storm') return <Zap className={`${size} text-yellow-300`} />;
    return <Sun className={`${size} text-yellow-400`} />;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Weather
          </span>
          <div className="flex items-center gap-2">
            <form onSubmit={handleCitySubmit} className="flex gap-2 no-drag">
              <input
                type="text"
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                placeholder="Enter city..."
                className="w-[152px] md:w-[216px] px-3 py-2 rounded-lg bg-background/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Button type="submit" size="sm" className="shrink-0">Set</Button>
            </form>
            <Button
              onClick={() => fetchWeather()}
              size="icon"
              variant="ghost"
              disabled={loading}
              className="h-8 w-8 hover:bg-accent/10"
              title="Refresh Weather"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden">

        {weather ? (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className={`${compact ? 'text-4xl' : 'text-5xl md:text-6xl'} font-bold text-foreground leading-none tracking-tighter`}>{Math.round(weather.temp)}°</p>
                <p className={`${compact ? 'text-base' : 'text-lg'} text-muted-foreground capitalize font-medium`}>{weather.description}</p>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {weather.city}
                </p>
              </div>
              <div className="drop-shadow-lg">
                {getWeatherIcon(weather.icon)}
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 ${compact ? 'pt-2' : 'pt-3'} border-t border-border`}>
              <div className={`flex items-center gap-3 ${compact ? 'p-2' : 'p-2.5'} rounded-xl bg-accent/10 border border-border`}>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Humidity</p>
                  <p className="text-foreground font-medium">{weather.humidity}%</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 ${compact ? 'p-2' : 'p-2.5'} rounded-xl bg-accent/10 border border-border`}>
                <div className="p-2 bg-gray-500/20 rounded-lg">
                  <Wind className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Wind</p>
                  <p className="text-foreground font-medium">{weather.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Enter your city to see the local weather forecast</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
