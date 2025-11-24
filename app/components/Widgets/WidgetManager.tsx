'use client';

import { useWidgets } from '@/lib/hooks/useWidgets';
import layoutConfig from '@/lib/config/layout.json';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Clock, Cloud, Image as ImageIcon, CheckSquare, StickyNote, Quote, Calendar as CalendarIcon, Wind, Book, Timer, Trash2 } from 'lucide-react'
import type React from 'react'
import { WidgetConfig } from '@/lib/types';

export default function WidgetManager() {
  const { widgets, addWidget, removeWidget, updateWidget, presets, applyPreset, capacity, lastPresetId } = useWidgets();

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {availableWidgets.map((widget) => {
          const isAdded = widgets.some((w) => w.type === widget.type && w.enabled);
          const rowsFor = (t: WidgetConfig['type']) => {
            const groupName = (sizeConfig.assignments as any)[t] || 'small';
            const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
            const capped = Math.max(1, Math.min(3, rawRows));
            const rowsInt = Math.ceil(capped);
            return rowsInt;
          };
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
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {widgets.filter(w => w.enabled).map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="capitalize text-sm font-medium text-foreground">{widget.type}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{`1x${rowsFor(widget.type)}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => removeWidget(widget.id)}
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-muted-foreground hover:text-destructive"
                >
                  <AnimatedIcon animationSrc="/lottie/Trash2.json" fallbackIcon={Trash2} className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {widgets.filter(w => w.enabled).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No active widgets</p>
          )}
        </div>
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
