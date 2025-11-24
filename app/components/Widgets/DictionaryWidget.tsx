'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Book, Loader2, Search, Volume2 } from 'lucide-react'

interface Definition {
    definition: string;
    example?: string;
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
}

interface WordData {
    word: string;
    phonetic?: string;
    phonetics: { text?: string; audio?: string }[];
    meanings: Meaning[];
}

export default function DictionaryWidget() {
    const [query, setQuery] = useState('');
    const [data, setData] = useState<WordData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);

    const searchWord = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
            if (!res.ok) throw new Error('Word not found');
            const json = await res.json();
            setData(json[0]);
        } catch (err) {
            setError('Word not found. Try another.');
        } finally {
            setLoading(false);
        }
    };

    const playAudio = () => {
        const audioUrl = data?.phonetics.find((p) => p.audio)?.audio;
        if (audioUrl) {
            new Audio(audioUrl).play();
        }
    };

    return (
        <div data-ui="widget" className="hover:shadow-lg transition-shadow duration-300 h-full w-full flex flex-col rounded-xl glass border text-card-foreground shadow-sm overflow-hidden p-4">
            {showWidgetHeaders ? (
                <div data-slot="header" className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center justify-start gap-2 text-foreground">
                        <AnimatedIcon animationSrc="/lottie/Book.json" fallbackIcon={Book} className="w-5 h-5" />
                        <span className="text-lg font-semibold">Dictionary</span>
                    </div>
                    <div className="flex items-center space-x-2" />
                </div>
            ) : null}
            <div data-slot="content" className={`flex-1 min-h-0 w-full flex flex-col items-center justify-start gap-4 p-4`}>
                <form onSubmit={searchWord} className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Define..."
                        className="h-8 bg-background/50 border-border text-xs"
                        aria-label="Define"
                    />
                    <Button type="submit" size="sm" variant="ghost" className="md:h-8 md:w-8 h-11 w-11 p-0 hover:bg-accent/10" aria-label="Search">
                        {loading ? <AnimatedIcon animationSrc="/lottie/Loader2.json" fallbackIcon={Loader2} className="w-4 h-4 animate-spin" /> : <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="w-4 h-4" />}
                    </Button>
                </form>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 w-full">
                    {error && <p className="text-red-400 text-xs text-center mt-4">{error}</p>}

                    {data && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground capitalize">{data.word}</h3>
                                    <p className="text-muted-foreground text-xs font-mono">{data.phonetic}</p>
                                </div>
                                {data.phonetics.some(p => p.audio) && (
                                    <Button onClick={playAudio} size="icon" variant="ghost" className="md:h-8 md:w-8 h-11 w-11 rounded-full hover:bg-primary/20 hover:text-primary">
                                        <AnimatedIcon animationSrc="/lottie/Volume2.json" fallbackIcon={Volume2} className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {data.meanings.slice(0, 2).map((meaning, i) => (
                                    <div key={i}>
                                        <p className="text-primary text-xs font-bold italic mb-1">{meaning.partOfSpeech}</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {meaning.definitions.slice(0, 2).map((def, j) => (
                                                <li key={j} className="text-foreground text-xs leading-relaxed">
                                                    {def.definition}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!data && !loading && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs text-center mt-4">
                            <AnimatedIcon animationSrc="/lottie/Book.json" fallbackIcon={Book} className="w-8 h-8 mb-2 opacity-50" />
                            <p>Search for a word to see its definition.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
