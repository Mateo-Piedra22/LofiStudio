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
  const buildGrid = React.useCallback(() => {
    const grid: { id: string | null; rowSpan: number; colSpan: number; start: boolean }[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ id: null, rowSpan: 1, colSpan: 1, start: false })));
    const fitsSingle = (r: number, c: number, rs: number) => {
      if (r + rs > rows) return false;
      for (let rr = r; rr < r + rs; rr++) { if (grid[rr][c].id) return false; }
      return true;
    };
    const fitsDouble = (r: number, c: number, rs: number) => {
      if (c >= cols - 1) return false;
      if (r + rs > rows) return false;
      for (let rr = r; rr < r + rs; rr++) { if (grid[rr][c].id || grid[rr][c + 1].id) return false; }
      return true;
    };
    enabled.forEach((w) => {
      const size = getSize(w);
      const rowSpan = getRowSpan(size);
      const colSpan = getColSpan(size);
      if (colSpan === 1) {
        let placed = false;
        for (let r = 0; r <= rows - rowSpan && !placed; r++) {
          for (let c = 0; c < cols && !placed; c++) {
            if (rowSpan === rows && r !== 0) break;
            if (fitsSingle(r, c, rowSpan)) {
              grid[r][c] = { id: w.id, rowSpan, colSpan: 1, start: true };
              for (let rr = r + 1; rr < r + rowSpan; rr++) grid[rr][c] = { id: w.id, rowSpan, colSpan: 1, start: false };
              placed = true;
            }
          }
        }
      } else {
        if (cols < 2) return;
        let placed = false;
        for (let r = 0; r <= rows - rowSpan && !placed; r++) {
          for (let c = 0; c < cols - 1 && !placed; c++) {
            if (rowSpan === rows && r !== 0) break;
            if (fitsDouble(r, c, rowSpan)) {
              grid[r][c] = { id: w.id, rowSpan, colSpan: 2, start: true };
              for (let rr = r + 1; rr < r + rowSpan; rr++) grid[rr][c] = { id: w.id, rowSpan, colSpan: 2, start: false };
              for (let rr = r; rr < r + rowSpan; rr++) grid[rr][c + 1] = { id: w.id, rowSpan, colSpan: 2, start: false };
              placed = true;
            }
          }
        }
      }
    });
    return grid;
  }, [enabled, rows, cols]);

  const [grid, setGrid] = React.useState(buildGrid());
  React.useEffect(() => {
    const prevIds: string[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]?.length || 0); c++) {
        const cell = grid[r][c];
        if (cell.id && cell.start) prevIds.push(cell.id);
      }
    }
    const nextIds = enabled.map(x => x.id);
    const setDiff = prevIds.length !== nextIds.length || prevIds.some(id => !nextIds.includes(id)) || nextIds.some(id => !prevIds.includes(id));
    const dimsDiff = grid.length !== rows || ((grid[0]?.length || 0) !== cols);
    if (setDiff || dimsDiff) setGrid(buildGrid());
  }, [enabled, rows, cols, buildGrid]);

  const [highlightCell, setHighlightCell] = React.useState<string | null>(null);

  function GridCell({ id, className, style }: { id?: string; className?: string; style?: React.CSSProperties }) {
    const { setNodeRef, isOver } = useDroppable(id ? { id } : { id: `cell-${Math.random().toString(36).slice(2)}`, disabled: true } as any);
    const ring = id
      ? (isOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse' : (id === highlightCell ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background' : ''))
      : '';
    return (
      <div ref={setNodeRef} style={style} className={cn('rounded-xl border border-white/10 bg-white/5 dark:bg-black/10 transition-all duration-200', isOver && 'bg-primary/20', ring, className)} />
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
    const r = Number(parts[1]);
    const c = Number(parts[2]);
    const draggedId = String(active.id);
    const w = enabled.find(x => x.id === draggedId);
    if (!w) return;
    const size = getSize(w);
    const rowSpan = getRowSpan(size);
    const colSpan = getColSpan(size);
    const withinBounds = (row: number, col: number) => row >= 0 && row + rowSpan <= rows && col >= 0 && (colSpan === 1 ? col < cols : col + 1 < cols);
    const work = grid.map(row => row.map(cell => ({ ...cell })));
    const regionFree = (row: number, col: number) => {
      if (!withinBounds(row, col)) return false;
      if (colSpan === 2) {
        for (let rr = row; rr < row + rowSpan; rr++) {
          if (work[rr][col].id || work[rr][col + 1].id) return false;
        }
        return true;
      } else {
        for (let rr = row; rr < row + rowSpan; rr++) {
          if (work[rr][col].id) return false;
        }
        return true;
      }
    };
    const nearestValidStart = (row: number, col: number) => {
      const candidates: { row: number; col: number; d: number }[] = [];
      if (colSpan === 2) {
        const pairs: number[] = [];
        if (col < cols - 1) pairs.push(col);
        if (col > 0) pairs.push(col - 1);
        for (const c0 of pairs) {
          for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
            if (regionFree(r0, c0)) candidates.push({ row: r0, col: c0, d: Math.abs(row - r0) + Math.abs(col - c0) });
          }
        }
      } else {
        for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
          if (regionFree(r0, col)) candidates.push({ row: r0, col, d: Math.abs(row - r0) });
        }
      }
      candidates.sort((a, b) => a.d - b.d);
      return candidates[0] || null;
    };
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        if (work[rr][cc].id === draggedId) work[rr][cc] = { id: null, rowSpan: 1, colSpan: 1, start: false };
      }
    }
    let targetRow = r;
    let targetCol = c;
    if (!regionFree(targetRow, targetCol)) {
      const near = nearestValidStart(r, c);
      if (!near) return;
      targetRow = near.row;
      targetCol = near.col;
    }
    const occupantAtTarget = work[targetRow][targetCol];
    if (occupantAtTarget && occupantAtTarget.id && occupantAtTarget.start && occupantAtTarget.id !== draggedId) {
      const oldIndex = widgets.findIndex(x => x.id === draggedId);
      const newIndex = widgets.findIndex(x => x.id === occupantAtTarget.id);
      if (oldIndex > -1 && newIndex > -1) reorderWidgets(oldIndex, newIndex);
      return;
    }
    if (colSpan === 2) {
      work[targetRow][targetCol] = { id: draggedId, rowSpan, colSpan, start: true };
      for (let rr2 = targetRow + 1; rr2 < targetRow + rowSpan; rr2++) work[rr2][targetCol] = { id: draggedId, rowSpan, colSpan, start: false };
      for (let rr2 = targetRow; rr2 < targetRow + rowSpan; rr2++) work[rr2][targetCol + 1] = { id: draggedId, rowSpan, colSpan, start: false };
    } else {
      work[targetRow][targetCol] = { id: draggedId, rowSpan, colSpan, start: true };
      for (let rr2 = targetRow + 1; rr2 < targetRow + rowSpan; rr2++) work[rr2][targetCol] = { id: draggedId, rowSpan, colSpan, start: false };
    }
    setGrid(work);
    setHighlightCell(null);
  };

  const handleDragOverGrid = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active?.id || !over?.id) { setHighlightCell(null); return; }
    const overId = String(over.id);
    if (!overId.startsWith('cell-')) { setHighlightCell(null); return; }
    const parts = overId.split('-');
    const r = Number(parts[1]);
    const c = Number(parts[2]);
    const draggedId = String(active.id);
    const w = enabled.find(x => x.id === draggedId);
    if (!w) { setHighlightCell(null); return; }
    const size = getSize(w);
    const rowSpan = getRowSpan(size);
    const colSpan = getColSpan(size);
    const withinBounds = (row: number, col: number) => row >= 0 && row + rowSpan <= rows && col >= 0 && (colSpan === 1 ? col < cols : col + 1 < cols);
    const work = grid.map(row => row.map(cell => ({ ...cell })));
    const regionFree = (row: number, col: number) => {
      if (!withinBounds(row, col)) return false;
      if (colSpan === 2) {
        for (let rr = row; rr < row + rowSpan; rr++) {
          if (work[rr][col].id || work[rr][col + 1].id) return false;
        }
        return true;
      } else {
        for (let rr = row; rr < row + rowSpan; rr++) {
          if (work[rr][col].id) return false;
        }
        return true;
      }
    };
    let targetRow = r;
    let targetCol = c;
    if (!regionFree(targetRow, targetCol)) {
      const candidates: { row: number; col: number; d: number }[] = [];
      if (colSpan === 2) {
        const pairs: number[] = [];
        if (targetCol < cols - 1) pairs.push(targetCol);
        if (targetCol > 0) pairs.push(targetCol - 1);
        for (const c0 of pairs) {
          for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
            if (regionFree(r0, c0)) candidates.push({ row: r0, col: c0, d: Math.abs(targetRow - r0) + Math.abs(targetCol - c0) });
          }
        }
      } else {
        for (let r0 = 0; r0 <= rows - rowSpan; r0++) {
          if (regionFree(r0, targetCol)) candidates.push({ row: r0, col: targetCol, d: Math.abs(targetRow - r0) });
        }
      }
      candidates.sort((a, b) => a.d - b.d);
      const near = candidates[0];
      if (!near) { setHighlightCell(null); return; }
      targetRow = near.row;
      targetCol = near.col;
    }
    setHighlightCell(`cell-${targetRow}-${targetCol}`);
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOverGrid} onDragEnd={handleDragEndGrid} onDragCancel={() => setHighlightCell(null)}>
          <div className={cn('relative grid grid-flow-row-dense items-stretch gap-4 auto-rows-[64px]', cols === 3 ? 'grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')} key={isDesktop ? 'desktop' : 'mobile'}>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              Array.from({ length: cols }).map((_, colIdx) => {
                const baseCell = grid[rowIdx][colIdx];
                const occupiedNonStart = !!baseCell.id && !baseCell.start;
                const occupiedStart = !!baseCell.id && baseCell.start;
                const extraCls = occupiedNonStart ? 'bg-primary/10 border-primary/30' : occupiedStart ? 'bg-primary/15 border-primary' : '';
                return (
                  <GridCell key={`base-${rowIdx}-${colIdx}`} id={`cell-${rowIdx}-${colIdx}`} className={cn('min-h-[64px] z-0', extraCls)} style={{ gridColumn: `${colIdx + 1}`, gridRow: `${rowIdx + 1}` }} />
                );
              })
            ))}
            {Array.from({ length: rows }).map((_, rowIdx) => (
              Array.from({ length: cols }).map((_, colIdx) => {
                const cell = grid[rowIdx][colIdx];
                if (!cell.id || !cell.start) return null;
                const item = widgets.find(w => w.id === cell.id)!;
                const size = getSize(item);
                const rowSpan = getRowSpan(size);
                const colSpan = getColSpan(size);
                return (
                  <div key={`item-${rowIdx}-${colIdx}`} style={{ gridColumn: `${colIdx + 1} / span ${colSpan}`, gridRow: `${rowIdx + 1} / span ${rowSpan}`, zIndex: 1 }}>
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
