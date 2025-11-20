import { useState, useCallback, useEffect } from 'react';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { useLocalStorage } from './useLocalStorage';
import type { WidgetConfig, WidgetPreset } from '../types';
import presetsJson from '@/lib/config/presets.json';
import layoutConfig from '@/lib/config/layout.json';



export function useWidgets() {
  const [widgets, setWidgets, widgetsLoaded] = useLocalStorage<WidgetConfig[]>('widgets', []);
  const tileW = (layoutConfig as any).tileW ?? 4;
  const tileH = (layoutConfig as any).tileH ?? 1;
  const capacity = (layoutConfig as any).capacity ?? 9;

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
      setWidgets(migratedWidgets);
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
        else blocks = Math.max(1, Math.min(3, Math.round(oldH))); // de 1-unidad por bloque
        if (oldY > 2) rowIndex = Math.max(0, Math.min(2, Math.round(oldY / 4))); // de 4-unidades por bloque
        else rowIndex = Math.max(0, Math.min(2, Math.round(oldY))); // de 1-unidad por bloque
        return { ...w, layout: { x: w.layout.x ?? 0, y: rowIndex * tileH, w: tileW, h: blocks * tileH } };
      });
      setWidgets(migrated);
    }
  }, []);

  const DEFAULT_SIZE: Record<WidgetConfig['type'], { w: number; h: number }> = {
    clock: { w: tileW, h: tileH },
    weather: { w: tileW, h: tileH },
    gif: { w: tileW, h: tileH },
    tasks: { w: tileW, h: tileH },
    notes: { w: tileW, h: tileH },
    quote: { w: tileW, h: tileH },
    calendar: { w: tileW, h: tileH },
    breathing: { w: tileW, h: tileH },
    dictionary: { w: tileW, h: tileH },
    timer: { w: tileW, h: tileH },
  };

  const presets: WidgetPreset[] = (presetsJson as any).presets as any;
  // We need to access the background setter, but it's in another component.
  // We can store the background preference in localStorage directly here as a side effect of applying a preset.
  const [, setBackgroundConfig] = useLocalStorage('backgroundConfig', { type: 'gradient' });
  const [, setPlaylist] = useLocalStorage<any[]>('playlist', []);
  const [, setCurrentVideo] = useLocalStorage<any | null>('currentVideo', null);
  const [, setQuoteCategory] = useLocalStorage('quoteCategory', 'motivation');
  const [lastPresetId, setLastPresetId] = useLocalStorage<string>('lastPresetId', 'empty');

  const addWidget = useCallback((type: WidgetConfig['type']) => {
    setWidgets((prev) => {
      const exists = prev.some((w) => w.type === type && w.enabled);
      if (exists) return prev;
      const usedBlocks = prev
        .filter((w) => w.enabled && w.layout)
        .reduce((sum, w) => sum + Math.max(1, Math.ceil(((w.layout!.h || tileH) / tileH))), 0);
      const heightFor = (t: WidgetConfig['type']) => {
        const groupName = (sizeConfig.assignments as any)[t] || 'small';
        const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
        const capped = Math.max(1, Math.min(3, rawRows));
        const rowsInt = Math.ceil(capped);
        return rowsInt * tileH;
      };
      const newSpan = Math.max(1, Math.ceil(heightFor(type) / tileH));
      if (usedBlocks + newSpan > capacity) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        }
        return prev;
      }
      const occupied = new Set<string>();
      prev
        .filter((w) => w.enabled && w.layout)
        .forEach((w) => {
          const span = Math.max(1, Math.ceil((w.layout.h || tileH) / tileH));
          for (let k = 0; k < span; k++) {
            occupied.add(`${w.layout.x},${(w.layout.y || 0) + k * tileH}`);
          }
        });
      const colTotals = [0, 0, 0];
      prev
        .filter((w) => w.enabled && w.layout)
        .forEach((w) => {
          const colIdx = Math.max(0, Math.min(2, Math.floor((w.layout.x || 0) / tileW)));
          const span = Math.max(1, Math.ceil((w.layout.h || tileH) / tileH));
          colTotals[colIdx] += span;
        });
      let placeX = -1;
      let placeY = -1;
      const span = newSpan;
      for (let idx = 0; idx < capacity; idx++) {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        if (row + span > 3) continue;
        if (colTotals[col] + span > 3) continue;
        if (span === 3 && row !== 0) continue;
        if (span === 2 && row > 1) continue;
        const x = col * tileW;
        const y = row * tileH;
        let fits = true;
        for (let k = 0; k < span; k++) {
          const key = `${x},${y + k * tileH}`;
          if (occupied.has(key)) { fits = false; break; }
        }
        if (fits) { placeX = x; placeY = y; break; }
      }
      if (placeX < 0 || placeY < 0) {
        window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        return prev;
      }
      const newWidget: WidgetConfig = {
        id: crypto.randomUUID(),
        type,
        layout: { x: placeX, y: placeY, w: tileW, h: heightFor(type) },
        enabled: true,
        settings: type === 'weather' ? { city: '' } : {},
      };
      return [...prev, newWidget];
    });
  }, [setWidgets, capacity, tileW, tileH]);

  useEffect(() => {
    const hasWidgets = widgets && widgets.length > 0;
    if (!widgetsLoaded || hasWidgets) return;
    const presetToApply = lastPresetId || 'empty';
    const exists = presets.some(p => p.id === presetToApply);
    const target = exists ? presetToApply : 'empty';
    applyPreset(target);
  }, [widgetsLoaded]);

  const updateWidgetLayout = useCallback((id: string, layout: { x: number; y: number; w: number; h: number }) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, layout } : w)));
  }, [setWidgets]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  }, [widgets, setWidgets]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  }, [widgets, setWidgets]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  }, [widgets, setWidgets]);

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
      const newWidgets: WidgetConfig[] = patternPlace(preset.widgets);
      setWidgets(newWidgets);

      if (preset.background) {
        setBackgroundConfig(preset.background);
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

  return {
    widgets,
    presets,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetLayout,
    toggleWidget,
    applyPreset,
    capacity,
    lastPresetId,
    widgetsLoaded,
  };
}
