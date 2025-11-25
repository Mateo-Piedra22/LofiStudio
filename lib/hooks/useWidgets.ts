import { useState, useCallback, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { useLocalStorage } from './useLocalStorage';
import type { WidgetConfig, WidgetPreset } from '../types';
import presetsJson from '@/lib/config/presets.json';
import layoutConfig from '@/lib/config/layout.json';



export function useWidgets() {
  const [widgets, setWidgets, widgetsLoaded] = useLocalStorage<WidgetConfig[]>('widgets', []);
  const tileW = (layoutConfig as any).tileW ?? 4;
  const tileH = (layoutConfig as any).tileH ?? 1;
  const baseCapacity = 9;
  const [capacity, setCapacity] = useState<number>(baseCapacity);

  const makeSpacer = () => ({ id: `spacer-${crypto.randomUUID()}`, type: 'SPACER' as const, layout: { x: 0, y: 0, w: tileW, h: tileH }, enabled: false, settings: {}, size: '1x1' as const });
  const padToCapacity = (arr: WidgetConfig[]) => {
    const next = [...arr];
    while (next.length < baseCapacity) next.push(makeSpacer());
    return next;
  };

  useEffect(() => {
    const needsLayoutInit = widgets.some((w: any) => !w.layout);
    if (needsLayoutInit) {
      const migratedWidgets = widgets.map((w: any) => {
        if (!w.layout) {
          return {
            ...w,
            layout: { x: 0, y: 0, w: tileW, h: tileH },
          };
        }
        return w;
      });
      setWidgets(padToCapacity(migratedWidgets));
    }
    // Migración de unidades: soporta layouts previos con tileH=4 o tileH=1
    const needsUnitMigration = widgets.some((w: any) => w.layout);
    if (needsUnitMigration) {
      const migrated = widgets.map((w: any) => {
        if (!w.layout) return w;
        const oldH = w.layout.h ?? tileH;
        const oldY = w.layout.y ?? 0;
        let blocks = oldH;
        let rowIndex = oldY;
        if (oldH > 3) blocks = Math.max(1, Math.min(3, Math.round(oldH / 4))); // de 4-unidades por bloque
        else blocks = Math.max(1, Math.min(3, Math.round(oldH))); // de 1-unidades por bloque
        if (oldY > 2) rowIndex = Math.max(0, Math.min(2, Math.round(oldY / 4))); // de 4-unidades por bloque
        else rowIndex = Math.max(0, Math.min(2, Math.round(oldY))); // de 1-unidades por bloque
        return { ...w, layout: { x: w.layout.x ?? 0, y: rowIndex * tileH, w: tileW, h: blocks * tileH } };
      });
      setWidgets(padToCapacity(migrated));
    }
    if (widgets.length < baseCapacity) {
      setWidgets(padToCapacity(widgets));
    }
  }, []);

  useEffect(() => {
    setCapacity(baseCapacity);
    const handler = (e: any) => {
      try {
        const cap = Number((e?.detail && (e.detail as any).capacity) || baseCapacity);
        setCapacity(Math.max(1, Math.min(9, cap)));
      } catch {}
    };
    window.addEventListener('responsive:capacity', handler as any);
    return () => window.removeEventListener('responsive:capacity', handler as any);
  }, []);

  const DEFAULT_SIZE: Record<WidgetConfig['type'], { w: number; h: number }> = {
    clock: { w: tileW, h: tileH },
    worldtime: { w: tileW, h: tileH },
    weather: { w: tileW, h: tileH },
    gif: { w: tileW, h: tileH },
    tasks: { w: tileW, h: tileH },
    notes: { w: tileW, h: tileH },
    quote: { w: tileW, h: tileH },
    calendar: { w: tileW, h: tileH },
    breathing: { w: tileW, h: tileH },
    dictionary: { w: tileW, h: tileH },
    timer: { w: tileW, h: tileH },
    SPACER: { w: tileW, h: tileH },
  };

  const presets: WidgetPreset[] = (presetsJson as any).presets as any;
  // We need to access the background setter, but it's in another component.
  // We can store the background preference in localStorage directly here as a side effect of applying a preset.
  const [backgroundConfig, setBackgroundConfig] = useLocalStorage('backgroundConfig', { type: 'gradient' });
  const [, setPlaylist] = useLocalStorage<any[]>('playlist', []);
  const [, setCurrentVideo] = useLocalStorage<any | null>('currentVideo', null);
  const [, setQuoteCategory] = useLocalStorage('quoteCategory', 'motivation');
  const [lastPresetId, setLastPresetId] = useLocalStorage<string>('lastPresetId', 'empty');

  const addWidget = useCallback((type: WidgetConfig['type'], size?: WidgetConfig['size']) => {
    setWidgets((prev) => {
      const exists = prev.some((w) => w.type === type && w.enabled);
      if (exists) return prev;
      const spanForSize = (s?: WidgetConfig['size']) => {
        if (!s) return 1;
        const parts = String(s).split('x');
        const h = Number(parts[1]) || 1;
        return Math.max(1, Math.min(3, Math.ceil(h)));
      };
      const defaultRows = (() => {
        const groupName = (sizeConfig.assignments as any)[type] || 'small';
        const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
        const capped = Math.max(1, Math.min(3, rawRows));
        return Math.ceil(capped);
      })();
      const resolvedSize: WidgetConfig['size'] = size || (`1x${defaultRows}` as WidgetConfig['size']);
      const usedBlocks = prev.filter(w => w.type !== 'SPACER' && w.enabled).reduce((sum, w) => sum + spanForSize(w.size), 0);
      const newSpan = spanForSize(resolvedSize);
      if (usedBlocks + newSpan > capacity) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        }
        return prev;
      }
      // Column fit constraints (3 columns desktop equivalent): ensure a 1x2 or 1x3 fits vertically
      const maxPerCol = 3;
      const totals = [0, 0, 0];
      const getRows = (w: WidgetConfig) => {
        if (w.size) {
          const parts = String(w.size).split('x');
          const h = Number(parts[1]) || 1;
          return Math.max(1, Math.min(3, h));
        }
        const grp = (sizeConfig.assignments as any)[w.type] || 'small';
        const r = (sizeConfig.groups as any)[grp]?.rows ?? 1;
        return Math.max(1, Math.min(3, Math.ceil(r)));
      };
      const enabled = prev.filter(w => w.enabled);
      enabled.forEach((w) => {
        const desired = getRows(w);
        const order = [0, 1, 2].sort((a, b) => totals[a] - totals[b]);
        const requiresTop = desired === maxPerCol;
        for (const c of order) {
          if (totals[c] + desired <= maxPerCol && (!requiresTop || totals[c] === 0)) {
            totals[c] += desired;
            break;
          }
        }
      });
      const desiredNew = (() => {
        const parts = String(resolvedSize).split('x');
        const h = Number(parts[1]) || 1;
        return Math.max(1, Math.min(3, h));
      })();
      const canPlace = [0, 1, 2].some((c) => {
        const requiresTop = desiredNew === maxPerCol;
        return totals[c] + desiredNew <= maxPerCol && (!requiresTop || totals[c] === 0);
      });
      if (!canPlace) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        }
        return prev;
      }
      const newWidget: WidgetConfig = {
        id: crypto.randomUUID(),
        type,
        layout: { x: 0, y: 0, w: tileW, h: newSpan * tileH },
        enabled: true,
        settings: type === 'weather' ? { city: '' } : {},
        size: resolvedSize,
      };
      const idx = prev.findIndex(w => w.type === 'SPACER');
      if (idx > -1) {
        const next = [...prev];
        next[idx] = newWidget;
        return padToCapacity(next);
      }
      return padToCapacity([...prev, newWidget]);
    });
  }, [setWidgets, capacity, tileW, tileH]);

  useEffect(() => {
    if (!widgetsLoaded) return;
    if (widgets.length < baseCapacity) {
      setWidgets(padToCapacity(widgets));
    }
  }, [widgetsLoaded]);

  

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map(w => w.id === id ? makeSpacer() : w);
      return padToCapacity(next);
    });
  }, [setWidgets]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets((prev) => padToCapacity(prev.map(w => w.id === id ? { ...w, ...updates } : w)));
  }, [setWidgets]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => padToCapacity(prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)));
  }, [setWidgets]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const patternPlace = (items: Omit<WidgetConfig,'id'>[]): WidgetConfig[] => {
        const ordered = [...items];
        const clockIdx = ordered.findIndex(i => i.type === 'clock');
        if (clockIdx > -1) {
          const [clk] = ordered.splice(clockIdx, 1);
          ordered.splice(1, 0, clk);
        }
        const heightUnitsFor = (t: string) => {
          const groupName = (sizeConfig.assignments as any)[t] || 'small';
          const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
          const capped = Math.max(1, Math.min(3, rawRows));
          const rowsInt = Math.ceil(capped);
          return rowsInt * tileH;
        };
        const cols: { id: string; type: string; h: number; settings?: any }[][] = [[], [], []];
        const totals = [0, 0, 0];
        const maxUnitsPerCol = 3 * tileH;
        ordered.forEach((w, idx) => {
          const desiredH = heightUnitsFor(w.type);
          const order = [0, 1, 2].sort((a, b) => totals[a] - totals[b]);
          let placed = false;
          for (const c of order) {
            const requiresTop = desiredH === maxUnitsPerCol;
            if (totals[c] + desiredH <= maxUnitsPerCol && (!requiresTop || totals[c] === 0)) {
              cols[c].push({ id: `${w.type}-${Date.now()}-${idx}`, type: w.type, h: desiredH, settings: w.settings || {} });
              totals[c] += desiredH;
              placed = true;
              break;
            }
          }
        });
        const result: WidgetConfig[] = [];
        cols.forEach((colItems, colIdx) => {
          let y = 0;
          colItems.forEach((ci) => {
            const x = colIdx * tileW;
            result.push({ id: ci.id, type: ci.type as any, layout: { x, y, w: tileW, h: ci.h }, enabled: true, settings: ci.settings || {} } as WidgetConfig);
            y += ci.h;
          });
        });
        return result;
      };
      const newWidgets: WidgetConfig[] = padToCapacity(patternPlace(preset.widgets));
      setWidgets(newWidgets);

      if (preset.background) {
        try {
          let existing: any = null;
          try {
            existing = JSON.parse(window.localStorage.getItem('backgroundConfig') || 'null');
          } catch {}
          const current = existing || (backgroundConfig as any);
          if (!current || current.type === 'gradient') {
            setBackgroundConfig(preset.background);
          }
        } catch {
          setBackgroundConfig(preset.background);
        }
      }

      if (preset.musicPlaylist && preset.musicPlaylist.length > 0) {
        setPlaylist(preset.musicPlaylist);
        setCurrentVideo(preset.musicPlaylist[0]);
      }

      // Find quote widget settings if exists and apply category
      const quoteWidget = preset.widgets.find(w => w.type === 'quote');
      if (quoteWidget && quoteWidget.settings && quoteWidget.settings.category) {
        setQuoteCategory(quoteWidget.settings.category);
      }
      setLastPresetId(presetId);
    }
  }, [presets, setWidgets, setBackgroundConfig, capacity, tileW, tileH]);

  const reorderWidgets = useCallback((oldIndex: number, newIndex: number) => {
    setWidgets((prev) => padToCapacity(arrayMove(prev, oldIndex, newIndex)));
  }, [setWidgets]);

  return {
    widgets,
    presets,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidget,
    applyPreset,
    capacity,
    lastPresetId,
    widgetsLoaded,
    reorderWidgets,
  };
}
