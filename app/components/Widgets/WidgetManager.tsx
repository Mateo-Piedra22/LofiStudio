'use client';

import { useWidgets } from '@/lib/hooks/useWidgets';
import layoutConfig from '@/lib/config/layout.json';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock, Cloud, Image as ImageIcon, CheckSquare, StickyNote, Quote, Calendar as CalendarIcon, Wind, Book, Timer, Trash2, GripVertical } from 'lucide-react'
import React from 'react'
import { WidgetConfig } from '@/lib/types';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px), (pointer: coarse)') : null as any;
    const evalMatch = () => setIsMobile(!!mq?.matches);
    evalMatch();
    mq?.addEventListener?.('change', evalMatch);
    return () => mq?.removeEventListener?.('change', evalMatch);
  }, []);
  return isMobile;
}

function SortableItem({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
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
  const { widgets, addWidget, removeWidget, updateWidget, updateWidgetLayout, presets, applyPreset, capacity, lastPresetId } = useWidgets();
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const enabledWidgets = widgets.filter(w => w.enabled);
  const [activeIds, setActiveIds] = React.useState<string[]>(enabledWidgets.map(w => w.id));
  React.useEffect(() => { setActiveIds(enabledWidgets.map(w => w.id)); }, [widgets]);

  const availableWidgets: { type: WidgetConfig['type']; label: string; iconName: string }[] = [
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
  ];

  const rowsFor = (t: WidgetConfig['type']) => {
    const groupName = (sizeConfig.assignments as any)[t] || 'small';
    const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
    const capped = Math.max(1, Math.min(3, rawRows));
    const rowsInt = Math.ceil(capped);
    return rowsInt;
  };
  const tileH = (layoutConfig as any).tileH ?? 1;
  const enabled = widgets.filter(w => w.enabled);
  const visible = enabled.slice(0, capacity);
  const usedBlocksVisible = visible.reduce((sum, w) => sum + Math.max(1, Math.ceil(((w.layout?.h || tileH) / tileH))), 0);
  const percent = Math.min(100, Math.round((usedBlocksVisible / capacity) * 100));
  const danger = usedBlocksVisible >= capacity;
  const hiddenCount = Math.max(0, enabled.length - visible.length);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active?.id || !over?.id || active.id === over.id) return;
    const oldIndex = activeIds.indexOf(String(active.id));
    const newIndex = activeIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    setActiveIds((items) => arrayMove(items, oldIndex, newIndex));
    const byId = new Map(widgets.map(w => [w.id, w] as const));
    const a = byId.get(String(active.id));
    const b = byId.get(String(over.id));
    if (!a || !b || !a.layout || !b.layout) return;
    const aLayout = a.layout;
    const bLayout = b.layout;
    updateWidgetLayout(a.id, { x: bLayout.x, y: bLayout.y, w: aLayout.w, h: aLayout.h });
    updateWidgetLayout(b.id, { x: aLayout.x, y: aLayout.y, w: bLayout.w, h: bLayout.h });
  };

  const spanClassFor = (t: WidgetConfig['type']) => {
    const groupName = (sizeConfig.assignments as any)[t] || 'small';
    const rows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
    const span = Math.max(1, Math.min(3, Math.round(rows)));
    if (span === 3) return 'col-span-1 lg:col-span-3';
    if (span === 2) return 'col-span-1 lg:col-span-2';
    return 'col-span-1';
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {availableWidgets.map((widget) => {
          const isAdded = widgets.some((w) => w.type === widget.type && w.enabled);
          const usedBlocks = widgets.filter(w => w.enabled).reduce((sum, w) => sum + Math.max(1, Math.ceil(((w.layout?.h || tileH) / tileH))), 0);
          const span = rowsFor(widget.type);
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
                addWidget(widget.type);
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${isAdded
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : atCapacity
                    ? 'bg-accent/10 border-border text-muted-foreground opacity-60 cursor-not-allowed'
                    : 'bg-accent/10 border-border text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                }`}
            >
              <span className="absolute top-2 right-2 text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{`1x${span}`}</span>
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
        {isDesktop ? (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={activeIds} strategy={rectSortingStrategy} key={isDesktop ? 'desktop-grid' : 'mobile-grid'}>
              <div className={cn('grid gap-3', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
                {activeIds.map((id) => {
                  const widget = widgets.find(w => w.id === id);
                  if (!widget) return null;
                  const spanCls = spanClassFor(widget.type);
                  return (
                    <SortableItem key={id} id={id} className={cn(spanCls)}>
                      <div className="flex items-center gap-3">
                        <span className="capitalize text-sm font-medium text-foreground">{widget.type}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{`1x${rowsFor(widget.type)}`}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          onClick={() => removeWidget(widget.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
                        </Button>
                      </div>
                    </SortableItem>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className={cn('grid gap-3', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')} key={isDesktop ? 'desktop-grid' : 'mobile-grid'}>
            {activeIds.map((id) => {
              const widget = widgets.find(w => w.id === id);
              if (!widget) return null;
              const spanCls = spanClassFor(widget.type);
              return (
                <div key={id} className={cn(spanCls, 'rounded-xl glass border text-card-foreground p-3')}> 
                  <div className="flex items-center gap-3">
                    <span className="capitalize text-sm font-medium text-foreground">{widget.type}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{`1x${rowsFor(widget.type)}`}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      onClick={() => removeWidget(widget.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {widgets.filter(w => w.enabled).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active widgets</p>
            )}
          </div>
        )}
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
