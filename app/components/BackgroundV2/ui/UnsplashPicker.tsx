'use client';

import { useState } from 'react';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

export function UnsplashPicker() {
    const setImageBackground = useBackgroundStore(s => s.setImageBackground);
    const [query, setQuery] = useState('');
    const [apiImages, setApiImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Curated list of high-quality Unsplash images (Fallback)
    const CURATED_IMAGES = [
        { id: '1555181126-11f8796245f3', label: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1555181126-11f8796245f3' },
        { id: '1518020382306-258052026330', label: 'Rainy Window', url: 'https://images.unsplash.com/photo-1518020382306-258052026330' },
        { id: '1470252649378-b736afb89566', label: 'Misty Forest', url: 'https://images.unsplash.com/photo-1470252649378-b736afb89566' },
        { id: '1516149487002-864a974950e1', label: 'Aesthetic Room', url: 'https://images.unsplash.com/photo-1516149487002-864a974950e1' },
    ];

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();

        // If query is empty, allow clearing but don't search blank
        if (!query.trim()) {
            setApiImages([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/unsplash?q=${encodeURIComponent(query)}`);

            if (!res.ok) {
                // If 500 (likely no key), fall back silently or show error
                if (res.status === 500) throw new Error('API Sync unavailable');
                throw new Error('Search failed');
            }

            const data = await res.json();
            // Unsplash search returns { results: [] }, list returns []
            const results = data.results || data || [];

            if (Array.isArray(results)) {
                setApiImages(results.map((img: any) => ({
                    id: img.id,
                    url: img.urls.small,
                    fullUrl: img.urls.regular,
                    label: img.description || 'Unsplash Image',
                    user: {
                        name: img.user.name,
                        username: img.user.username,
                        link: img.user.links.html
                    },
                    downloadLocation: img.links.download_location
                })));
            }
        } catch (err) {
            console.error(err);
            setError('Could not load new images. Using offline selection.');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerDownload = async (downloadLocation?: string) => {
        if (!downloadLocation) return;
        try {
            await fetch('/api/unsplash/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ downloadLocation })
            });
        } catch (e) {
            console.error('Failed to trigger download event', e);
        }
    };

    const handleSelectImage = (img: any) => {
        setImageBackground(img.fullUrl);
        if (img.downloadLocation) {
            triggerDownload(img.downloadLocation);
        }
    };

    // Combine sources
    const displayImages = apiImages.length > 0
        ? apiImages
        : CURATED_IMAGES.map(img => ({
            id: img.id,
            url: `${img.url}?auto=format&fit=crop&w=600&q=80`,
            fullUrl: `${img.url}?auto=format&fit=crop&w=1920&q=90`,
            label: img.label,
            user: { name: 'Unsplash', link: 'https://unsplash.com' } // Fallback attribution
        }));

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Unsplash (e.g. cyber, nature)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button type="submit" size="icon" variant="outline" disabled={isLoading}>
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {displayImages.map((img) => (
                    <div
                        key={img.id}
                        className="relative group overflow-hidden rounded-lg border border-border aspect-video bg-muted cursor-pointer"
                        onClick={() => handleSelectImage(img)}
                    >
                        <img
                            src={img.url}
                            alt={img.label}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                        {/* Attribution Overlay - Required by Unsplash Guidelines */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                            <span className="text-white font-medium text-xs truncate mb-0.5">{img.label}</span>
                            <div className="text-[10px] text-white/80 truncate" onClick={(e) => e.stopPropagation()}>
                                Photo by{' '}
                                <a
                                    href={`${img.user?.link}?utm_source=LofiStudio&utm_medium=referral`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-white"
                                >
                                    {img.user?.name}
                                </a>
                                {' '}on{' '}
                                <a
                                    href="https://unsplash.com/?utm_source=LofiStudio&utm_medium=referral"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-white"
                                >
                                    Unsplash
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{apiImages.length > 0 ? 'Results from Unsplash' : 'Curated Selection'}</span>
                <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground flex items-center gap-1"
                >
                    Photos by Unsplash <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
