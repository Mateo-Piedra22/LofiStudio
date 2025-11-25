'use client';

import { useWidgets } from '@/lib/hooks/useWidgets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock, Cloud, Image as ImageIcon, CheckSquare, StickyNote, Quote, Calendar as CalendarIcon, Wind, Book, Timer, Trash2, GripVertical } from 'lucide-react'
import React from 'react'
import { WidgetConfig } from '@/lib/types';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const { widgets, addWidget, removeWidget, updateWidget, presets, applyPreset, capacity, lastPresetId, reorderWidgets } = useWidgets();
  const isDesktop = useIsDesktop();
  const isLandscape = useIsLandscape();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const enabledWidgets = widgets.filter(w => w.enabled);
  const [activeIds, setActiveIds] = React.useState<string[]>(enabledWidgets.map(w => w.id));
  React.useEffect(() => { setActiveIds(enabledWidgets.map(w => w.id)); }, [widgets]);

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

  const enabled = widgets.filter(w => w.enabled);
  const visible = enabled.slice(0, capacity);
  const blocksForSize = (s: WidgetConfig['size'] | undefined) => {
    if (s === '1x2' || s === '2x2') return 2;
    return 1;
  };
  const usedBlocksVisible = visible.reduce((sum, w) => sum + blocksForSize(w.size), 0);
  const percent = Math.min(100, Math.round((usedBlocksVisible / capacity) * 100));
  const danger = usedBlocksVisible >= capacity;
  const hiddenCount = Math.max(0, enabled.length - visible.length);

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
    return '1x1';
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
    return 'col-span-1 row-span-1';
  };

  const rows = 3;
  const cols = isDesktop ? 3 : (isLandscape ? 2 : 1);
  const initialGrid = React.useMemo(() => {
    const grid: { id: string | null; rowSpan: number; colSpan: number; start: boolean }[][] = Array.from({ length: cols }, () => Array.from({ length: rows }, () => ({ id: null, rowSpan: 1, colSpan: 1, start: false })));
    const totals = Array.from({ length: cols }, () => 0);
    enabled.forEach((w) => {
      const size = getSize(w);
      const rowSpan = getRowSpan(size);
      const colSpan = getColSpan(size);
      if (colSpan === 1) {
        const order = Array.from({ length: cols }, (_, i) => i).sort((a, b) => totals[a] - totals[b]);
        const requiresTop = rowSpan === rows;
        for (const c of order) {
          if (totals[c] + rowSpan <= rows && (!requiresTop || totals[c] === 0)) {
            const startRow = totals[c];
            grid[c][startRow] = { id: w.id, rowSpan, colSpan: 1, start: true };
            for (let r = startRow + 1; r < startRow + rowSpan; r++) grid[c][r] = { id: w.id, rowSpan, colSpan: 1, start: false };
            totals[c] = startRow + rowSpan;
            break;
          }
        }
      } else {
        if (cols < 2) return;
        const pairs: [number, number][] = Array.from({ length: cols - 1 }, (_, i) => [i, i + 1]);
        const orderedPairs = pairs.sort((pA, pB) => Math.max(totals[pA[0]], totals[pA[1]]) - Math.max(totals[pB[0]], totals[pB[1]]));
        const requiresTop = rowSpan === rows;
        for (const [c1, c2] of orderedPairs) {
          const startRow = Math.max(totals[c1], totals[c2]);
          if (startRow + rowSpan <= rows && (!requiresTop || startRow === 0)) {
            grid[c1][startRow] = { id: w.id, rowSpan, colSpan: 2, start: true };
            for (let r = startRow + 1; r < startRow + rowSpan; r++) grid[c1][r] = { id: w.id, rowSpan, colSpan: 2, start: false };
            for (let r = startRow; r < startRow + rowSpan; r++) grid[c2][r] = { id: w.id, rowSpan, colSpan: 2, start: false };
            totals[c1] = startRow + rowSpan;
            totals[c2] = startRow + rowSpan;
            break;
          }
        }
      }
    });
    return grid;
  }, [enabled, isDesktop, isLandscape]);

  const [highlightCell, setHighlightCell] = React.useState<string | null>(null);

  function GridCell({ id, className, style }: { id?: string; className?: string; style?: React.CSSProperties }) {
    const { setNodeRef, isOver } = useDroppable(id ? { id } : { id: `cell-${Math.random().toString(36).slice(2)}`, disabled: true } as any);
    const ring = id
      ? (isOver ? 'ring-2 ring-primary' : (id === highlightCell ? 'ring-2 ring-primary/60' : ''))
      : '';
    return (
      <div ref={setNodeRef} style={style} className={cn('rounded-xl border border-white/10 bg-white/5 dark:bg-black/10 transition-colors', isOver && 'bg-primary/20', ring, className)} />
    );
  }

  function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = { transform: CSS.Transform.toString(transform) } as React.CSSProperties;
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  }

  const handleDragEndGrid = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active?.id || !over?.id) return;
    const overId = String(over.id);
    if (!overId.startsWith('cell-')) return;
    const parts = overId.split('-');
    const c = Number(parts[1]);
    const r = Number(parts[2]);
    const draggedId = String(active.id);
    const w = enabled.find(x => x.id === draggedId);
    if (!w) return;
    const occupantStart = initialGrid[c][r];
    if (occupantStart && occupantStart.id && occupantStart.start && occupantStart.id !== draggedId) {
      const oldIndex = widgets.findIndex(x => x.id === draggedId);
      const newIndex = widgets.findIndex(x => x.id === occupantStart.id);
      if (oldIndex > -1 && newIndex > -1) reorderWidgets(oldIndex, newIndex);
      return;
    }
    const size = getSize(w);
    const rowSpan = getRowSpan(size);
    const colSpan = getColSpan(size);
    const withinBounds = (cc: number, rr: number) => rr >= 0 && rr + rowSpan <= rows && cc >= 0 && (colSpan === 1 ? cc < cols : cc + 1 < cols);
    const grid = initialGrid.map(col => col.map(cell => ({ ...cell })));
    const regionFree = (cc: number, rr: number) => {
      if (!withinBounds(cc, rr)) return false;
      if (colSpan === 2) {
        for (let r2 = rr; r2 < rr + rowSpan; r2++) {
          if (grid[cc][r2].id || grid[cc + 1][r2].id) return false;
        }
        return true;
      } else {
        for (let r2 = rr; r2 < rr + rowSpan; r2++) {
          if (grid[cc][r2].id) return false;
        }
        return true;
      }
    };
    const nearestValidStart = (cc: number, rr: number) => {
      const candidates: { cc: number; rr: number; d: number }[] = [];
      if (colSpan === 2) {
        const pairs: number[] = [];
        if (cc < cols - 1) pairs.push(cc);
        if (cc > 0) pairs.push(cc - 1);
        for (const c0 of pairs) {
          for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
            if (regionFree(c0, r0)) candidates.push({ cc: c0, rr: r0, d: Math.abs(cc - c0) + Math.abs(rr - r0) });
          }
        }
      } else {
        for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
          if (regionFree(cc, r0)) candidates.push({ cc, rr: r0, d: Math.abs(rr - r0) });
        }
      }
      candidates.sort((a, b) => a.d - b.d);
      return candidates[0] || null;
    };
    for (let cc = 0; cc < cols; cc++) {
      for (let rr = 0; rr < rows; rr++) {
        if (grid[cc][rr].id === draggedId) grid[cc][rr] = { id: null, rowSpan: 1, colSpan: 1, start: false };
      }
    }
    let targetC = c;
    let targetR = r;
    if (!regionFree(targetC, targetR)) {
      const near = nearestValidStart(c, r);
      if (!near) return;
      targetC = near.cc;
      targetR = near.rr;
    }
    if (colSpan === 2) {
      grid[targetC][targetR] = { id: draggedId, rowSpan, colSpan, start: true };
      for (let rr2 = targetR + 1; rr2 < targetR + rowSpan; rr2++) grid[targetC][rr2] = { id: draggedId, rowSpan, colSpan, start: false };
      for (let rr2 = targetR; rr2 < targetR + rowSpan; rr2++) grid[targetC + 1][rr2] = { id: draggedId, rowSpan, colSpan, start: false };
    } else {
      grid[targetC][targetR] = { id: draggedId, rowSpan, colSpan, start: true };
      for (let rr2 = targetR + 1; rr2 < targetR + rowSpan; rr2++) grid[targetC][rr2] = { id: draggedId, rowSpan, colSpan, start: false };
    }
    const placedIds: string[] = [];
    for (let cc = 0; cc < cols; cc++) {
      for (let rr = 0; rr < rows; rr++) {
        const cell = grid[cc][rr];
        if (cell.id && cell.start) placedIds.push(cell.id);
      }
    }
    const currentIds = enabled.map(x => x.id);
    const targetIds = placedIds.concat(currentIds.filter(id => !placedIds.includes(id)));
    const working = [...currentIds];
    for (let i = 0; i < targetIds.length; i++) {
      const id = targetIds[i];
      const curIdx = working.indexOf(id);
      if (curIdx !== i) {
        const oldIndex = widgets.findIndex(w => w.id === id);
        reorderWidgets(oldIndex, i);
        const [moved] = working.splice(curIdx, 1);
        working.splice(i, 0, moved);
      }
    }
    setHighlightCell(null);
  };

  const handleDragOverGrid = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active?.id || !over?.id) { setHighlightCell(null); return; }
    const overId = String(over.id);
    if (!overId.startsWith('cell-')) { setHighlightCell(null); return; }
    const parts = overId.split('-');
    const c = Number(parts[1]);
    const r = Number(parts[2]);
    const draggedId = String(active.id);
    const w = enabled.find(x => x.id === draggedId);
    if (!w) { setHighlightCell(null); return; }
    const size = getSize(w);
    const rowSpan = getRowSpan(size);
    const colSpan = getColSpan(size);
    const withinBounds = (cc: number, rr: number) => rr >= 0 && rr + rowSpan <= rows && cc >= 0 && (colSpan === 1 ? cc < cols : cc + 1 < cols);
    const grid = initialGrid.map(col => col.map(cell => ({ ...cell })));
    const regionFree = (cc: number, rr: number) => {
      if (!withinBounds(cc, rr)) return false;
      if (colSpan === 2) {
        for (let r2 = rr; r2 < rr + rowSpan; r2++) {
          if (grid[cc][r2].id || grid[cc + 1][r2].id) return false;
        }
        return true;
      } else {
        for (let r2 = rr; r2 < rr + rowSpan; r2++) {
          if (grid[cc][r2].id) return false;
        }
        return true;
      }
    };
    let targetC = c;
    let targetR = r;
    if (!regionFree(targetC, targetR)) {
      const candidates: { cc: number; rr: number; d: number }[] = [];
      if (colSpan === 2) {
        const pairs: number[] = [];
        if (targetC < cols - 1) pairs.push(targetC);
        if (targetC > 0) pairs.push(targetC - 1);
        for (const c0 of pairs) {
          for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
            if (regionFree(c0, r0)) candidates.push({ cc: c0, rr: r0, d: Math.abs(targetC - c0) + Math.abs(targetR - r0) });
          }
        }
      } else {
        for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
          if (regionFree(targetC, r0)) candidates.push({ cc: targetC, rr: r0, d: Math.abs(targetR - r0) });
        }
      }
      candidates.sort((a, b) => a.d - b.d);
      const near = candidates[0];
      if (!near) { setHighlightCell(null); return; }
      targetC = near.cc;
      targetR = near.rr;
    }
    setHighlightCell(`cell-${targetC}-${targetR}`);
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOverGrid} onDragEnd={handleDragEndGrid}>
          <div className={cn('relative grid grid-flow-row-dense items-stretch gap-4 auto-rows-[64px]', cols === 3 ? 'grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')} key={isDesktop ? 'desktop' : 'mobile'}>
            {Array.from({ length: cols }).map((_, colIdx) => (
              Array.from({ length: rows }).map((_, rowIdx) => {
                const baseCell = initialGrid[colIdx][rowIdx];
                const occupiedNonStart = !!baseCell.id && !baseCell.start;
                const occupiedStart = !!baseCell.id && baseCell.start;
                const extraCls = occupiedNonStart ? 'bg-primary/10 border-primary/30' : occupiedStart ? 'bg-primary/15 border-primary' : '';
                return (
                  <GridCell key={`base-${colIdx}-${rowIdx}`} id={`cell-${colIdx}-${rowIdx}`} className={cn('min-h-[64px] z-0', extraCls)} style={{ gridColumn: `${colIdx + 1}`, gridRow: `${rowIdx + 1}` }} />
                );
              })
            ))}
            {Array.from({ length: cols }).map((_, colIdx) => (
              Array.from({ length: rows }).map((_, rowIdx) => {
                const cell = initialGrid[colIdx][rowIdx];
                if (!cell.id || !cell.start) return null;
                const item = widgets.find(w => w.id === cell.id)!;
                const size = getSize(item);
                const rowSpan = getRowSpan(size);
                const colSpan = getColSpan(size);
                return (
                  <div key={`item-${colIdx}-${rowIdx}`} style={{ gridColumn: `${colIdx + 1} / span ${colSpan}`, gridRow: `${rowIdx + 1} / span ${rowSpan}`, zIndex: 1 }}>
                    <DraggableItem id={String(cell.id)}>
                      <div className="rounded-xl glass border text-card-foreground p-3 h-full w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="capitalize text-sm font-medium text-foreground">{item.type}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{String(size)}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            onClick={() => removeWidget(String(cell.id))}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </DraggableItem>
                  </div>
                );
              })
            ))}
          </div>
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
