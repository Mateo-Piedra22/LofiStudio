'use client';

import { useState } from 'react';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

export function UnsplashPicker() {
    const setImageBackground = useBackgroundStore(s => s.setImageBackground);
    const [query, setQuery] = useState('');
    // Curated list of high-quality Unsplash images for Lofi/Focus
    const CURATED_IMAGES = [
        { id: '1555181126-11f8796245f3', label: 'Cozy Cafe' },
        { id: '1518020382306-258052026330', label: 'Rainy Window' },
        { id: '1470252649378-b736afb89566', label: 'Misty Forest' },
        { id: '1516149487002-864a974950e1', label: 'Aesthetic Room' },
        { id: '1480796927426-f609979314bd', label: 'City Night' },
        { id: '1507525428034-b723cf961d3e', label: 'Sunset Ocean' },
        { id: '1519681393797-a1e943f635f9', label: 'Starry Sky' },
        { id: '1598153356860-25c79808d9dd', label: 'Autumn Leaves' },
        { id: '1493246507139-91e8fad9978e', label: 'Mountain Lake' },
        { id: '1529333446548-aaef530db97c', label: 'Cozy Desk' },
        { id: '1504608524841-420391490815', label: 'Neon Tokyo' },
        { id: '1448375240586-df417c6961d8', label: 'Winter Cabin' },
    ];

    const getImages = () => {
        // Simple mock search filter
        const filtered = query
            ? CURATED_IMAGES.filter(img => img.label.toLowerCase().includes(query.toLowerCase()))
            : CURATED_IMAGES;

        return filtered.map(img => ({
            id: img.id,
            url: `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&w=600&q=80`,
            fullUrl: `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&w=1920&q=90`,
            label: img.label
        }));
    };

    const images = getImages();

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter scenes (e.g. cafe, rain, night)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((img) => (
                    <button
                        key={img.id}
                        onClick={() => setImageBackground(img.fullUrl)}
                        className="relative group overflow-hidden rounded-lg border border-border aspect-video bg-muted"
                        title={img.label}
                    >
                        <img
                            src={img.url}
                            alt={img.label}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white font-medium">{img.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-end">
                <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    Photos by Unsplash <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
