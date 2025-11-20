import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 z-50">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <p className="text-white/60 text-sm font-medium tracking-widest uppercase">Loading Studio...</p>
            </div>
        </div>
    );
}
