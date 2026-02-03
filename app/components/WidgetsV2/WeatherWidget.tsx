/**
 * WeatherWidget v2
 * Displays current weather with location support
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud, Sun, CloudRain, CloudSnow, CloudLightning,
    CloudFog, Wind, Droplets, Thermometer, MapPin, Search, X
} from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import type { WidgetAction } from '@/lib/types/widget.types';

interface WeatherData {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    city: string;
    country: string;
}

interface WeatherWidgetProps {
    id: string;
    settings?: {
        city?: string;
        units?: 'metric' | 'imperial';
        showDetails?: boolean;
    };
}

// Weather icon mapping
const WEATHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'clear': Sun,
    'clouds': Cloud,
    'rain': CloudRain,
    'drizzle': CloudRain,
    'snow': CloudSnow,
    'thunderstorm': CloudLightning,
    'mist': CloudFog,
    'fog': CloudFog,
    'haze': CloudFog,
};

const STORAGE_KEY = 'lofi-weather-city-v2';

/**
 * Weather widget with search and geolocation
 */
export function WeatherWidget({ id, settings }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const showHeaders = useWidgetGridStore(state => state.showHeaders);
    const updateWidgetSettings = useWidgetGridStore(state => state.updateWidgetSettings);

    // Settings with defaults
    const units = settings?.units ?? 'metric';
    const showDetails = settings?.showDetails ?? true;

    // Fetch weather data
    const fetchWeather = useCallback(async (city?: string, coords?: { lat: number; lon: number }) => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query params
            let query = '';
            if (coords) {
                query = `lat=${coords.lat}&lon=${coords.lon}`;
            } else if (city) {
                query = `q=${encodeURIComponent(city)}`;
            } else {
                throw new Error('No location provided');
            }

            const response = await fetch(
                `/api/weather?${query}&units=${units}`,
                { signal: AbortSignal.timeout(10000) }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch weather');
            }

            const data = await response.json();

            setWeather({
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed),
                icon: data.weather[0].main.toLowerCase(),
                city: data.name,
                country: data.sys.country,
            });

            // Save city for future use
            if (city && typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, city);
            }

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load weather');
        } finally {
            setIsLoading(false);
        }
    }, [units]);

    // Get user location
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(undefined, {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (err) => {
                // Fallback to saved city or default
                const savedCity = typeof window !== 'undefined'
                    ? localStorage.getItem(STORAGE_KEY)
                    : null;
                fetchWeather(savedCity || 'New York');
            }
        );
    }, [fetchWeather]);

    // Initial load
    useEffect(() => {
        const savedCity = typeof window !== 'undefined'
            ? localStorage.getItem(STORAGE_KEY)
            : null;

        if (settings?.city) {
            fetchWeather(settings.city);
        } else if (savedCity) {
            fetchWeather(savedCity);
        } else {
            getUserLocation();
        }
    }, [settings?.city, fetchWeather, getUserLocation]);

    // Handle search submit
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchWeather(searchQuery.trim());
            setShowSearch(false);
            setSearchQuery('');
        }
    }, [searchQuery, fetchWeather]);

    // Get weather icon component
    const WeatherIcon = weather
        ? (WEATHER_ICONS[weather.icon] || Cloud)
        : Cloud;

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'search',
            icon: showSearch ? 'X' : 'Search',
            label: showSearch ? 'Close' : 'Search city',
            onClick: () => setShowSearch(!showSearch),
        },
        {
            id: 'location',
            icon: 'MapPin',
            label: 'Use my location',
            onClick: getUserLocation,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Weather"
            icon="Cloud"
            showHeader={showHeaders}
            actions={actions}
            isLoading={isLoading}
            error={error}
            onRefresh={() => weather && fetchWeather(weather.city)}
            contentClassName="p-3"
        >
            <AnimatePresence mode="wait">
                {/* Search input */}
                {showSearch && (
                    <motion.form
                        key="search"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSearch}
                        className="mb-3"
                    >
                        <div className="flex gap-2">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter city name..."
                                className="h-8 text-sm"
                                autoFocus
                            />
                            <Button type="submit" size="sm" className="h-8 px-3">
                                <Search className="w-3 h-3" />
                            </Button>
                        </div>
                    </motion.form>
                )}

                {/* Weather display */}
                {weather && !isLoading && (
                    <motion.div
                        key="weather"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{weather.city}, {weather.country}</span>
                        </div>

                        {/* Main weather */}
                        <div className="flex items-center gap-3">
                            <WeatherIcon className="w-10 h-10 text-primary" />
                            <div>
                                <p className="text-3xl font-bold text-foreground">
                                    {weather.temperature}°{units === 'metric' ? 'C' : 'F'}
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {weather.description}
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        {showDetails && (
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3" />
                                    <span>{weather.humidity}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wind className="w-3 h-3" />
                                    <span>{weather.windSpeed} {units === 'metric' ? 'm/s' : 'mph'}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </WidgetWrapper>
    );
}

export default WeatherWidget;
