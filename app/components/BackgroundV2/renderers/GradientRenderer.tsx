'use client';

import { memo } from 'react';

interface GradientRendererProps {
    blur: number;
}

export const GradientRenderer = memo(function GradientRenderer({ blur }: GradientRendererProps) {
    return (
        <div
            className="fixed inset-0 -z-50 w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 animate-gradient-xy transition-all duration-1000"
            style={{ filter: `blur(${blur}px)` }}
        />
    );
});
