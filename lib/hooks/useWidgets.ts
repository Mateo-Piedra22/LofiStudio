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
    if (!widgetsLoaded) return;
    try {
      const raw = window.localStorage.getItem('widgets');
      const saved = raw ? JSON.parse(raw) : null;
      const hasSaved = Array.isArray(saved) && saved.length > 0;
      const migratedFlagKey = 'widgets_migrated_v2';
      const shouldMigrate = !window.localStorage.getItem(migratedFlagKey);

      if (shouldMigrate && hasSaved) {
        const items = saved as any[];
        const needsLayoutInit = items.some((w: any) => !w.layout);
        if (needsLayoutInit) {
          const migratedWidgets = items.map((w: any) => {
            if (!w.layout) {
              return { ...w, layout: { x: 0, y: 0, w: tileW, h: tileH } };
            }
            return w;
          });
          setWidgets(padToCapacity(migratedWidgets as any));
          window.localStorage.setItem(migratedFlagKey, '1');
          return;
        }
        const needsUnitMigration = items.some((w: any) => w.layout);
        if (needsUnitMigration) {
          const migrated = items.map((w: any) => {
            if (!w.layout) return w;
            const oldH = w.layout.h ?? tileH;
            const oldY = w.layout.y ?? 0;
            let blocks = oldH;
            let rowIndex = oldY;
            if (oldH > 3) blocks = Math.max(1, Math.min(3, Math.round(oldH / 4)));
            else blocks = Math.max(1, Math.min(3, Math.round(oldH)));
            if (oldY > 2) rowIndex = Math.max(0, Math.min(2, Math.round(oldY / 4)));
            else rowIndex = Math.max(0, Math.min(2, Math.round(oldY)));
            return { ...w, layout: { x: w.layout.x ?? 0, y: rowIndex * tileH, w: tileW, h: blocks * tileH } };
          });
          setWidgets(padToCapacity(migrated as any));
          window.localStorage.setItem(migratedFlagKey, '1');
          return;
        }
      }

      if (!hasSaved && widgets.length < baseCapacity) {
        setWidgets(padToCapacity(widgets));
      }
    } catch {}
  }, [widgetsLoaded, widgets]);

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
      // Helper to calculate blocks (width * height)
      const getBlocks = (s?: WidgetConfig['size']) => {
        if (!s) return 1;
        const parts = String(s).split('x');
        const w = Number(parts[0]) || 1;
        const h = Number(parts[1]) || 1;
        return w * h;
      };

      // Helper to calculate rows (height)
      const getRowsFromSize = (s?: WidgetConfig['size']) => {
        if (!s) return 1;
        const parts = String(s).split('x');
        const h = Number(parts[1]) || 1;
        return Math.max(1, Math.min(3, Math.ceil(h)));
      };

      const defaultSize = (() => {
        const groupName = (sizeConfig.assignments as any)[type] || 'small';
        const group = (sizeConfig.groups as any)[groupName];
        const rawRows = group?.rows ?? 1;
        const rawCols = group?.cols ?? 1;
        const rowsInt = Math.ceil(Math.max(1, Math.min(3, rawRows)));
        const colsInt = Math.ceil(Math.max(1, Math.min(3, rawCols)));
        return `${colsInt}x${rowsInt}` as WidgetConfig['size'];
      })();
      const resolvedSize: WidgetConfig['size'] = size || defaultSize;
      
      const usedBlocks = prev.filter(w => w.type !== 'SPACER' && w.enabled).reduce((sum, w) => sum + getBlocks(w.size), 0);
      const newBlocks = getBlocks(resolvedSize);
      
      if (usedBlocks + newBlocks > capacity) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        }
        return prev;
      }
      
      // Check if it fits in the 3x3 grid using robust layout simulation
      const checkGridFit = () => {
        // Helper to resolve size consistently
        const resolveSize = (w: WidgetConfig | { type: string, size?: any }) => {
            if (w.size) return w.size;
            
            const groupName = (sizeConfig.assignments as any)[w.type] || 'small';
            const group = (sizeConfig.groups as any)[groupName];
            const rawRows = group?.rows ?? 1;
            const rawCols = group?.cols ?? 1;
            
            const rowsInt = Math.ceil(Math.max(1, Math.min(3, rawRows)));
            const colsInt = Math.ceil(Math.max(1, Math.min(3, rawCols)));
            
            return (`${colsInt}x${rowsInt}`) as WidgetConfig['size'];
        };

        const grid = Array(3).fill(null).map(() => Array(3).fill(false));
        const activeWidgets = prev.filter(w => w.type !== 'SPACER' && w.enabled);
        
        // Items to place: existing enabled widgets + new one
        const itemsToPlace = [
            ...activeWidgets.map(w => ({ type: w.type, size: resolveSize(w) })), 
            { type, size: resolvedSize }
        ];

        for (const item of itemsToPlace) {
            const parts = String(item.size).split('x');
            const w = Number(parts[0]) || 1;
            const h = Number(parts[1]) || 1;
            
            let placed = false;
            // Scan for first fit (row-major)
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (placed) break;
                    
                    if (r + h > 3 || c + w > 3) continue; // Out of bounds
                    
                    let fits = true;
                    // Check collision
                    for (let ir = 0; ir < h; ir++) {
                        for (let ic = 0; ic < w; ic++) {
                            if (grid[r + ir][c + ic]) {
                                fits = false;
                                break;
                            }
                        }
                        if (!fits) break;
                    }
                    
                    if (fits) {
                        // Mark occupied
                        for (let ir = 0; ir < h; ir++) {
                            for (let ic = 0; ic < w; ic++) {
                                grid[r + ir][c + ic] = true;
                            }
                        }
                        placed = true;
                    }
                }
                if (placed) break;
            }
            if (!placed) return false;
        }
        return true;
      };

      if (!checkGridFit()) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('grid-capacity-reached'));
        }
        return prev;
      }
      
      const newSpan = getRowsFromSize(resolvedSize);
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

  const moveWidgetToGrid = useCallback((sourceIndex: number, targetIndex: number, cols: number = 3) => {
    setWidgets((prev) => {
      const next = [...prev];
      if (sourceIndex < 0 || sourceIndex >= next.length || targetIndex < 0 || targetIndex >= next.length) return prev;
      if (sourceIndex === targetIndex) return prev;

      // Helper to get block height (rows)
      const getRows = (w: WidgetConfig) => {
        if (!w) return 1;
        const parts = String(w.size || '1x1').split('x');
        const h = Number(parts[1]) || 1;
        return Math.max(1, Math.min(3, Math.ceil(h)));
      };

      const sourceWidget = next[sourceIndex];
      const rows = getRows(sourceWidget);

      // Validate target bounds
      const targetRow = Math.floor(targetIndex / cols);
      if (targetRow + rows > 3) {
        // Cannot fit vertically
        return prev;
      }

      // Perform Block Swap
      // We swap the entire column-slice that the widget occupies
      // If widget is 1x2, we swap [source, source+cols] with [target, target+cols]
      // This preserves the content of the target area by moving it to the source area
      
      // We iterate from bottom to top to handle overlaps correctly? 
      // Actually, standard swap order doesn't matter for non-overlapping, but for overlapping (moving down),
      // we traced it works.
      
      for (let i = 0; i < rows; i++) {
        const sIdx = sourceIndex + (i * cols);
        const tIdx = targetIndex + (i * cols);

        if (sIdx < next.length && tIdx < next.length) {
          const tmp = next[sIdx];
          next[sIdx] = next[tIdx];
          next[tIdx] = tmp;
        }
      }

      return padToCapacity(next);
    });
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
    moveWidgetToGrid, // Export new function
  };
}
