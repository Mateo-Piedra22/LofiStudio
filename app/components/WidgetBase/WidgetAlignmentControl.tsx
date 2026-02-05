'use client';

import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { WidgetStyle } from '@/lib/types/widget.types';

interface WidgetAlignmentControlProps {
    currentStyle?: WidgetStyle;
    onUpdate: (style: WidgetStyle) => void;
    isLoading?: boolean;
}

export function WidgetAlignmentControl({
    currentStyle,
    onUpdate,
    isLoading
}: WidgetAlignmentControlProps) {
    const justifyContent = currentStyle?.justifyContent || 'start'; // Vertical in flex-col
    const alignItems = currentStyle?.alignItems || 'start';         // Horizontal in flex-col

    // Helper to determine active state
    const isActive = (j: string, a: string) => justifyContent === j && alignItems === a;

    const handleSelect = (j: 'start' | 'center' | 'end', a: 'start' | 'center' | 'end') => {
        onUpdate({
            ...currentStyle,
            justifyContent: j,
            alignItems: a
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    aria-label="Content Alignment"
                >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground text-center mb-1">
                        Content Position
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                        {/* Top Row */}
                        <AlignBtn
                            active={isActive('start', 'start')}
                            onClick={() => handleSelect('start', 'start')}
                            icon="align-top-left"
                        />
                        <AlignBtn
                            active={isActive('start', 'center')}
                            onClick={() => handleSelect('start', 'center')}
                            icon="align-top-center"
                        />
                        <AlignBtn
                            active={isActive('start', 'end')}
                            onClick={() => handleSelect('start', 'end')}
                            icon="align-top-right"
                        />

                        {/* Middle Row */}
                        <AlignBtn
                            active={isActive('center', 'start')}
                            onClick={() => handleSelect('center', 'start')}
                            icon="align-mid-left"
                        />
                        <AlignBtn
                            active={isActive('center', 'center')}
                            onClick={() => handleSelect('center', 'center')}
                            icon="align-mid-center"
                        />
                        <AlignBtn
                            active={isActive('center', 'end')}
                            onClick={() => handleSelect('center', 'end')}
                            icon="align-mid-right"
                        />

                        {/* Bottom Row */}
                        <AlignBtn
                            active={isActive('end', 'start')}
                            onClick={() => handleSelect('end', 'start')}
                            icon="align-bot-left"
                        />
                        <AlignBtn
                            active={isActive('end', 'center')}
                            onClick={() => handleSelect('end', 'center')}
                            icon="align-bot-center"
                        />
                        <AlignBtn
                            active={isActive('end', 'end')}
                            onClick={() => handleSelect('end', 'end')}
                            icon="align-bot-right"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Simple button component for the grid
function AlignBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-8 h-8 rounded flex items-center justify-center border transition-all",
                active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
            )}
        >
            {/* Visual representation of the alignment */}
            <div className={cn(
                "w-4 h-4 rounded-[2px] border flex",
                active ? "border-primary-foreground/50" : "border-current opacity-50",
                getInnerClasses(icon)
            )}>
                <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
            </div>
        </button>
    );
}

function getInnerClasses(icon: string) {
    // Map abstract icon names to flex classes for the mini icon preview
    // Note: We are simulating the flex-col layout of the widget
    switch (icon) {
        case 'align-top-left': return 'justify-start items-start';
        case 'align-top-center': return 'justify-start items-center';
        case 'align-top-right': return 'justify-start items-end';

        case 'align-mid-left': return 'justify-center items-start';
        case 'align-mid-center': return 'justify-center items-center';
        case 'align-mid-right': return 'justify-center items-end';

        case 'align-bot-left': return 'justify-end items-start';
        case 'align-bot-center': return 'justify-end items-center';
        case 'align-bot-right': return 'justify-end items-end';
        default: return 'justify-center items-center';
    }
}
