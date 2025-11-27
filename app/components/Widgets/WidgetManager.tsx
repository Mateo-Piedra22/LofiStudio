'use client';

import { useWidgets } from '@/lib/hooks/useWidgets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock, Cloud, Image as ImageIcon, CheckSquare, StickyNote, Quote, Calendar as CalendarIcon, Wind, Book, Timer, Trash2, GripVertical, Activity, Target, Calculator, Link as LinkIcon, Globe, BookOpen } from 'lucide-react'
import React from 'react'
import { WidgetConfig } from '@/lib/types';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, pointerWithin, DragStartEvent, DragOverlay, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)') : null as any;
    const evalMatch = () => setIsDesktop(!!mq?.matches);
    evalMatch();
    mq?.addEventListener?.('change', evalMatch);
    return () => mq?.removeEventListener?.('change', evalMatch);
  }, []);
  return isDesktop;
}

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = React.useState(true);
  React.useEffect(() => {
    const mql = typeof window !== 'undefined' ? window.matchMedia('(orientation: landscape)') : null as any;
    const init = () => { if (mql) setIsLandscape(!!mql.matches); };
    const handler = (e: any) => setIsLandscape(!!e.matches);
    init();
    mql?.addEventListener?.('change', handler);
    return () => { mql?.removeEventListener?.('change', handler); };
  }, []);
  return isLandscape;
}

function SortableItem({ id, children, className, variant = 'default', extraStyle, isOver, isOverlay }: { id: string; children?: React.ReactNode; className?: string; variant?: 'default' | 'bare'; extraStyle?: React.CSSProperties; isOver?: boolean; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    ...extraStyle,
  } as React.CSSProperties;

  if (isOverlay) {
    return (
      <div style={{ ...extraStyle, zIndex: 999 }} className={cn("relative cursor-grabbing", className)}>
        <div className="h-full w-full relative">
           {children}
        </div>
      </div>
    )
  }

  if (variant === 'bare') {
    return (
      <div ref={setNodeRef} style={style} className={cn(className, isOver && "ring-2 ring-primary ring-inset bg-primary/10 rounded-xl transition-all duration-200")} {...attributes}>
        <div className="hidden lg:block opacity-0 h-full w-full" />
      </div>
    );
  }
  return (
    <div ref={setNodeRef} style={style} className={cn("relative", className, isOver && "ring-2 ring-primary ring-inset bg-primary/10 rounded-xl transition-all duration-200")} {...attributes}>
      <div className="h-full w-full relative group">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted/50" {...listeners}>
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

function WidgetContent({ item, size, multi, onRemove }: { item: WidgetConfig, size: string, multi: boolean, onRemove: (id: string) => void }) {
  return (
    <div className={cn("rounded-xl glass border text-card-foreground p-3 pl-9 h-full w-full flex items-center justify-between", multi ? 'ring-2 ring-primary/40 border-primary/40' : '')}>
      <div className="flex items-center gap-3">
        <span className="capitalize text-sm font-medium text-foreground">{item.type}</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{String(size)}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          onClick={(e) => {
             e.stopPropagation();
             e.preventDefault();
             onRemove(String(item.id));
          }}
          onPointerDown={(e) => e.stopPropagation()} 
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive z-30 relative"
        >
          <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function WidgetManager() {
  const { widgets, addWidget, removeWidget, updateWidget, presets, applyPreset, capacity, lastPresetId, reorderWidgets, moveWidgetToGrid } = useWidgets();
  const isDesktop = useIsDesktop();
  const isLandscape = useIsLandscape();
  const [rowHeight] = useLocalStorage('minigridRowHeight', 52);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // Helper to calculate visible widgets that fit in the 3x3 grid (9 blocks)
  const visibleWidgets = React.useMemo(() => {
    // We assume desktop 3x3 for this logic as it's the main issue
    // For mobile, we just show everything usually, but let's keep consistency
    const limit = 9; 
    const result: WidgetConfig[] = [];
    let blocksUsed = 0;

    // Helper to get size (duplicated from below, but needed here)
    const getWSize = (w: WidgetConfig) => {
        if (w.size) return w.size;
        
        const groupName = (sizeConfig.assignments as any)[w.type] || 'small';
        const group = (sizeConfig.groups as any)[groupName];
        const rawRows = group?.rows ?? 1;
        const rawCols = group?.cols ?? 1;
        
        const rowsInt = Math.ceil(Math.max(1, Math.min(3, rawRows)));
        const colsInt = Math.ceil(Math.max(1, Math.min(3, rawCols)));
        
        return (`${colsInt}x${rowsInt}`) as WidgetConfig['size'];
    };

    for (const w of widgets) {
      const size = getWSize(w);
      const parts = String(size).split('x');
      const width = Number(parts[0]) || 1;
      const height = Number(parts[1]) || 1;
      const blocks = width * height;

      if (blocksUsed + blocks <= limit) {
        result.push(w);
        blocksUsed += blocks;
      } else if (w.type !== 'SPACER') {
        // Always show real widgets even if they overflow, to avoid losing them UI-wise
        result.push(w);
        blocksUsed += blocks;
      }
      // Spacers that overflow are dropped
    }
    return result;
  }, [widgets]);

  const gridItems = visibleWidgets; // Use the pruned list
  const realWidgets = gridItems.filter(w => w.type !== 'SPACER' && w.enabled);

  const blocksForSize = (s: WidgetConfig['size'] | undefined) => {
    if (!s) return 1;
    const parts = String(s).split('x');
    const w = Number(parts[0]) || 1;
    const h = Number(parts[1]) || 1;
    return w * h;
  };
  
  const getRobustSize = (w: WidgetConfig) => {
      if (w.size) return w.size;
      
      const groupName = (sizeConfig.assignments as any)[w.type] || 'small';
      const group = (sizeConfig.groups as any)[groupName];
      const rawRows = group?.rows ?? 1;
      const rawCols = group?.cols ?? 1;
      
      const rowsInt = Math.ceil(Math.max(1, Math.min(3, rawRows)));
      const colsInt = Math.ceil(Math.max(1, Math.min(3, rawCols)));
      
      return (`${colsInt}x${rowsInt}`) as WidgetConfig['size'];
  };

  const WIDGET_DEFINITIONS = [
    { type: 'clock', label: 'Clock', iconName: 'Clock' },
    { type: 'worldtime', label: 'World Time', iconName: 'Clock' },
    { type: 'weather', label: 'Weather', iconName: 'Cloud' },
    { type: 'gif', label: 'GIF', iconName: 'Image' },
    { type: 'tasks', label: 'Tasks', iconName: 'CheckSquare' },
    { type: 'notes', label: 'Notes', iconName: 'StickyNote' },
    { type: 'quote', label: 'Quote', iconName: 'Quote' },
    { type: 'calendar', label: 'Calendar', iconName: 'Calendar' },
    { type: 'breathing', label: 'Breathing', iconName: 'Wind' },
    { type: 'dictionary', label: 'Dictionary', iconName: 'Book' },
    { type: 'timer', label: 'Timer', iconName: 'Timer' },
    { type: 'habit', label: 'Habits', iconName: 'Activity' },
    { type: 'focus', label: 'Focus', iconName: 'Target' },
    { type: 'calculator', label: 'Calculator', iconName: 'Calculator' },
    { type: 'quicklinks', label: 'Quick Links', iconName: 'Link' },
    { type: 'flashcard', label: 'Flashcards', iconName: 'BookOpen' },
    { type: 'embed', label: 'Embed', iconName: 'Globe' },
  ] as const;

  const availableWidgets = WIDGET_DEFINITIONS.map(def => ({
      ...def,
      size: getRobustSize({ type: def.type } as WidgetConfig)
  }));

  const usedBlocksVisible = realWidgets.reduce((sum, w) => sum + blocksForSize(getRobustSize(w)), 0);
  const percent = Math.min(100, Math.round((usedBlocksVisible / capacity) * 100));
  const danger = usedBlocksVisible >= capacity;
  const hiddenCount = 0;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEndList = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    const { active, over } = event;
    if (!active?.id || !over?.id) return;
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);

      // Use moveWidgetToGrid (Block Swap) for all moves to prevent shifting
      moveWidgetToGrid(oldIndex, newIndex, cols);
    }
  };

  const getSize = (w: WidgetConfig): WidgetConfig['size'] => {
    return getRobustSize(w);
  };
  const getRowSpan = (s: WidgetConfig['size'] | undefined) => {
    if (!s) return 1;
    const parts = String(s).split('x');
    const h = Number(parts[1]) || 1;
    return Math.max(1, Math.min(3, Math.ceil(h)));
  };
  const getColSpan = (s: WidgetConfig['size'] | undefined) => {
    if (!s) return 1;
    const v = String(s);
    if (v === '2x1' || v === '2x2') return 2;
    if (v === '3x1') return 3;
    return 1;
  };
  const spanClassForSize = (s: WidgetConfig['size'] | undefined) => {
    if (s === '3x1') return 'col-span-1 lg:col-span-3 row-span-1';
    if (s === '2x2') return 'col-span-1 lg:col-span-2 row-span-2';
    if (s === '2x1') return 'col-span-1 lg:col-span-2 row-span-1';
    if (s === '1x3') return 'col-span-1 row-span-3';
    if (s === '1x2') return 'col-span-1 row-span-2';
    return 'col-span-1 row-span-1';
  };
  const cols = isDesktop ? 3 : (isLandscape ? 2 : 1);

  // Strategy that disables sorting visualization (items stay put until dropped)
  const noOpStrategy = () => null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Capacidad de bloques</p>
          <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">{`${usedBlocksVisible} / ${capacity}`}</span>
        </div>
        {hiddenCount > 0 && (
          <div className="text-xs text-muted-foreground">{`Ocultos por viewport: ${hiddenCount}`}</div>
        )}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${danger ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-5">
        {availableWidgets.map((widget) => {
          const isAdded = widgets.some((w) => w.type === widget.type && w.enabled);
          const usedBlocks = widgets.filter(w => w.enabled).reduce((sum, w) => sum + blocksForSize(getRobustSize(w)), 0);
          const parts = String(widget.size).split('x');
          const widgetBlocks = (Number(parts[0]) || 1) * (Number(parts[1]) || 1);
          const atCapacity = usedBlocks + widgetBlocks > capacity;
          return (
            <button
              key={widget.type}
              onClick={() => {
                if (isAdded) return;
                if (atCapacity) {
                  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
                  return;
                }
                addWidget(widget.type, widget.size);
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${isAdded
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : atCapacity
                    ? 'bg-accent/10 border-border text-muted-foreground opacity-60 cursor-not-allowed'
                    : 'bg-accent/10 border-border text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                }`}
            >
              <span className="absolute top-2 right-2 text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{widget.size}</span>
              {(() => {
                const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
                  Clock,
                  Cloud,
                  Image: ImageIcon,
                  CheckSquare,
                  StickyNote,
                  Quote,
                  Calendar: CalendarIcon,
                  Wind,
                  Book,
                  Timer,
                  Activity,
                  Target,
                  Calculator,
                  Link: LinkIcon,
                  Globe,
                  BookOpen,
                }
                const Fallback = ICON_MAP[widget.iconName] || Clock
                return <AnimatedIcon animationSrc={`/lottie/${widget.iconName}.json`} fallbackIcon={Fallback} className="w-8 h-8 mb-2" />
              })()}
              <span className="text-sm font-medium">{widget.label}</span>
              {isAdded && <span className="text-xs mt-1 opacity-60">Added</span>}
              {(!isAdded && atCapacity) && <span className="text-xs mt-1 opacity-60">Capacity reached</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Active Widgets</h3>
        <DndContext 
          sensors={sensors} 
          collisionDetection={pointerWithin} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDragEnd={handleDragEndList}
        >
          <SortableContext items={gridItems.map(w => w.id)} strategy={noOpStrategy}>
            <div className="relative">
              <div className={cn('pointer-events-none absolute inset-0 z-0 hidden lg:grid gap-3 items-stretch', cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')} style={{ gridAutoRows: `${rowHeight}px` }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={`base-${i}`} className="h-full w-full rounded-xl border border-white/10 bg-white/5 dark:bg-black/10" />
                ))}
              </div>
              <div className={cn('relative z-10 grid gap-3 items-stretch', cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-dense' : cols === 2 ? 'grid-cols-2 grid-flow-dense' : 'grid-cols-1')} key={isDesktop ? 'desktop' : 'mobile'} style={{ gridAutoRows: `${rowHeight}px` }}>
              {gridItems.map((item) => {
                const size = getSize(item);
                const cls = spanClassForSize(size);
                const isSpacer = item.type === 'SPACER';
                const isDragging = activeId === item.id;
                
                if (isSpacer) {
                  return (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      className={cn('col-span-1 hidden lg:block', cls)}
                      variant="bare"
                      extraStyle={{ gridRowEnd: `span ${getRowSpan(size)}`, gridColumnEnd: `span ${getColSpan(size)}`, opacity: isDragging ? 0.3 : 1 }}
                      isOver={overId === item.id}
                    />
                  );
                }
                const multi = getRowSpan(size) > 1 || getColSpan(size) > 1;
                return (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    className={cn('col-span-1', cls)}
                    extraStyle={{ gridRowEnd: `span ${getRowSpan(size)}`, gridColumnEnd: `span ${getColSpan(size)}`, opacity: isDragging ? 0.3 : 1 }}
                    isOver={overId === item.id}
                  >
                    <WidgetContent item={item} size={String(size)} multi={multi} onRemove={removeWidget} />
                  </SortableItem>
                );
              })}
              </div>
            </div>
          </SortableContext>
          {createPortal(
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
            }}>
              {activeId ? (() => {
                const activeWidget = widgets.find(w => w.id === activeId);
                if (!activeWidget) return null;
                const size = getSize(activeWidget);
                const multi = getRowSpan(size) > 1 || getColSpan(size) > 1;
                
                // Explicitly set width/height based on DOM element to prevent stretching/shrinking
                const activeNode = typeof document !== 'undefined' ? document.getElementById(activeId) : null;
                const style = activeNode ? { width: activeNode.offsetWidth, height: activeNode.offsetHeight } : {};

                return (
                  <div style={style}>
                    <SortableItem 
                        id={activeWidget.id} 
                        isOverlay 
                        className={cn(spanClassForSize(size))}
                    >
                        {activeWidget.type === 'SPACER' ? (
                        <div className="h-full w-full bg-primary/10 rounded-xl" /> 
                        ) : (
                        <WidgetContent item={activeWidget} size={String(size)} multi={multi} onRemove={removeWidget} />
                        )}
                    </SortableItem>
                  </div>
                )
              })() : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((p) => (
            <div key={p.id} className={`p-3 rounded-xl glass border ${p.id === lastPresetId ? 'border-primary' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    {p.name}
                    {p.id === lastPresetId && <Badge variant="secondary">Activo</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </div>
                <Button
                  size="sm"
                  variant={p.id === lastPresetId ? 'secondary' : 'default'}
                  disabled={p.id === lastPresetId}
                  onClick={() => applyPreset(p.id)}
                >
                  {p.id === lastPresetId ? 'Activo' : 'Usar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
