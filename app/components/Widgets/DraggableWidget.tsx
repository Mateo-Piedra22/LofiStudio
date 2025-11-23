'use client';

import React, { ReactNode } from 'react';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { GripHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
    children: ReactNode;
    title?: string;
    onRemove?: () => void;
    isEditing: boolean;
    className?: string;
    // Props injected by react-grid-layout
    style?: React.CSSProperties;
    className_rgl?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

const DraggableWidget = React.forwardRef<HTMLDivElement, DraggableWidgetProps>(({ 
    children,
    title,
    onRemove,
    isEditing,
    className,
    style,
    className_rgl,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            style={style}
            className={cn(
                "relative group transition-all duration-200 h-full w-full",
                isEditing && "ring-2 ring-primary/50 rounded-2xl cursor-move",
                className_rgl,
                className
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            data-ui="widget"
            {...props}
        >
            <div className={cn(
                "h-full w-full overflow-hidden rounded-xl transition-all duration-300",
                !isEditing && "hover:shadow-lg"
            )}>
                {children}
            </div>
            {isEditing && (
                <>
                    <div className="widget-drag-handle absolute top-2 left-1/2 -translate-x-1/2 p-1 rounded-full bg-accent/20 text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <AnimatedIcon animationSrc="/lottie/GripHorizontal.json" fallbackIcon={GripHorizontal} className="w-4 h-4" />
                    </div>
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors z-50"
                        >
                            <AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-3 h-3" />
                        </button>
                    )}
                    <div className="absolute inset-0 z-10 pointer-events-none" />
                </>
            )}
        </div>
    );
});

DraggableWidget.displayName = 'DraggableWidget';

export default DraggableWidget;
