'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';

interface SwipeableModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string; // For the inner panel
    containerClassName?: string; // For the outer fixed container
}

export function SwipeableModal({
    isOpen,
    onClose,
    title,
    children,
    className,
    containerClassName
}: SwipeableModalProps) {
    const touchStartYRef = useRef<number | null>(null);
    const touchDeltaYRef = useRef<number>(0);
    const { isMobile } = useBreakpoint();

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartYRef.current = e.touches[0]?.clientY || 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartYRef.current == null) return;
        touchDeltaYRef.current = (e.touches[0]?.clientY || 0) - (touchStartYRef.current || 0);
    };

    const handleTouchEnd = () => {
        if ((touchDeltaYRef.current || 0) > 80) onClose();
        touchStartYRef.current = null;
        touchDeltaYRef.current = 0;
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200",
                containerClassName
            )}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Modal"}
        >
            <div className={cn(
                "w-full glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200",
                className
            )}>
                {/* Visual handle for mobile swipe hint */}
                <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-50 mb-2" />

                {(title || true) && (
                    <div className="flex justify-between items-center mb-6">
                        {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
                        <Button onClick={onClose} variant="ghost" size="icon" className="text-foreground shrink-0">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                )}
                {children}
            </div>

            {/* Click outside to close (Desktop usually, but good fallback) */}
            <div className="fixed inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
