'use client';

import { useWidgets } from '@/lib/hooks/useWidgets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock, Cloud, Image as ImageIcon, CheckSquare, StickyNote, Quote, Calendar as CalendarIcon, Wind, Book, Timer, Trash2, GripVertical } from 'lucide-react'
import React from 'react'
import { WidgetConfig } from '@/lib/types';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
//
import { cn } from '@/lib/utils';

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

function SortableItem({ id, children, className, variant = 'default' }: { id: string; children?: React.ReactNode; className?: string; variant?: 'default' | 'bare' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: isDragging ? CSS.Transform.toString(transform) : undefined,
    transition: isDragging ? transition : undefined,
  } as React.CSSProperties;
  if (variant === 'bare') {
    return (
      <div ref={setNodeRef} style={style} className={className} {...attributes}>
        <div className="hidden lg:block opacity-0 h-full w-full" />
      </div>
    );
  }
  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes}>
      <div className="flex items-center justify-between p-3 rounded-xl glass border text-card-foreground">
        <div className="flex items-center gap-2">
          <button className="h-6 w-6 flex items-center justify-center rounded-sm text-muted-foreground" {...listeners}>
            <GripVertical className="w-4 h-4" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function WidgetManager() {
  const { widgets, addWidget, removeWidget, updateWidget, presets, applyPreset, capacity, lastPresetId, reorderWidgets } = useWidgets();
  const isDesktop = useIsDesktop();
  const isLandscape = useIsLandscape();
  // Mini-grid uses fixed base row height to match 1x1 visual blocks
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const gridItems = widgets.slice(0, 9);
  const realWidgets = gridItems.filter(w => w.type !== 'SPACER' && w.enabled);

  const availableWidgets: { type: WidgetConfig['type']; label: string; iconName: string; size: WidgetConfig['size'] }[] = [
    { type: 'clock', label: 'Clock', iconName: 'Clock', size: '1x1' },
    { type: 'worldtime', label: 'World Time', iconName: 'Clock', size: '1x1' },
    { type: 'weather', label: 'Weather', iconName: 'Cloud', size: '1x1' },
    { type: 'gif', label: 'GIF', iconName: 'Image', size: '1x2' },
    { type: 'tasks', label: 'Tasks', iconName: 'CheckSquare', size: '1x2' },
    { type: 'notes', label: 'Notes', iconName: 'StickyNote', size: '1x2' },
    { type: 'quote', label: 'Quote', iconName: 'Quote', size: '1x1' },
    { type: 'calendar', label: 'Calendar', iconName: 'Calendar', size: '1x2' },
    { type: 'breathing', label: 'Breathing', iconName: 'Wind', size: '1x2' },
    { type: 'dictionary', label: 'Dictionary', iconName: 'Book', size: '1x2' },
    { type: 'timer', label: 'Timer', iconName: 'Timer', size: '1x1' },
  ];

  const blocksForSize = (s: WidgetConfig['size'] | undefined) => {
    if (!s) return 1;
    const parts = String(s).split('x');
    const h = Number(parts[1]) || 1;
    return Math.max(1, Math.min(3, Math.ceil(h)));
  };
  const usedBlocksVisible = realWidgets.reduce((sum, w) => sum + blocksForSize(w.size), 0);
  const percent = Math.min(100, Math.round((usedBlocksVisible / capacity) * 100));
  const danger = usedBlocksVisible >= capacity;
  const hiddenCount = 0;

  const handleDragEndList = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active?.id || !over?.id) return;
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      reorderWidgets(oldIndex, newIndex);
    }
  };

  const getSize = (w: WidgetConfig): WidgetConfig['size'] => {
    if (w.size) return w.size;
    const groupName = (sizeConfig.assignments as any)[w.type] || 'small';
    const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
    const capped = Math.max(1, Math.min(3, rawRows));
    const rowsInt = Math.ceil(capped);
    return (`1x${rowsInt}`) as WidgetConfig['size'];
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
    return 1;
  };
  const spanClassForSize = (s: WidgetConfig['size'] | undefined) => {
    if (s === '2x1') return 'col-span-1 lg:col-span-2';
    if (s === '1x2') return 'col-span-1 row-span-2';
    if (s === '2x2') return 'col-span-1 lg:col-span-2 row-span-2';
    if (s === '1x3') return 'col-span-1 row-span-3';
    if (s === '3x1') return 'col-span-1 lg:col-span-3';
    return 'col-span-1 row-span-1';
  };
  const cols = isDesktop ? 3 : (isLandscape ? 2 : 1);

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
          const usedBlocks = widgets.filter(w => w.enabled).reduce((sum, w) => sum + blocksForSize(w.size), 0);
          const span = widget.size === '1x2' || widget.size === '2x2' ? 2 : 1;
          const atCapacity = usedBlocks + span > capacity;
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndList}>
          <SortableContext items={gridItems.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="relative">
              <div className={cn('pointer-events-none absolute inset-0 z-0 hidden lg:grid gap-4 auto-rows-[64px]', cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={`base-${i}`} className="rounded-xl border border-white/10 bg-white/5 dark:bg-black/10" />
                ))}
              </div>
              <div className={cn('relative z-10 grid gap-4 auto-rows-[64px]', cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')} key={isDesktop ? 'desktop' : 'mobile'}>
              {gridItems.map((item) => {
                const size = getSize(item);
                const cls = spanClassForSize(size);
                const isSpacer = item.type === 'SPACER';
                if (isSpacer) {
                  return (
                    <SortableItem key={item.id} id={item.id} className={cn('col-span-1 hidden lg:block', cls)} variant="bare" />
                  );
                }
                return (
                  <SortableItem key={item.id} id={item.id} className={cn('col-span-1', cls)}>
                    <div className="rounded-xl glass border text-card-foreground p-3 h-full w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="capitalize text-sm font-medium text-foreground">{item.type}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{String(size)}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          onClick={() => removeWidget(String(item.id))}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
              </div>
            </div>
          </SortableContext>
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
