'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import sizeConfig from '@/lib/config/widget-sizes.json';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useCloudSync } from '@/lib/hooks/useCloudSync';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useToast, ToastContainer } from '@/app/components/Toast';
import Player from '@/app/components/Player';
import TopNavbar from '@/app/components/TopNavbar';
import PomodoroTimer from '@/app/components/Timer/PomodoroTimer';
import WeatherWidget from '@/app/components/Widgets/WeatherWidget';
import ClockWidget from '@/app/components/Widgets/ClockWidget';
import WorldTimeWidget from '@/app/components/Widgets/WorldTimeWidget';
import GifWidget from '@/app/components/Widgets/GifWidget';
import TaskManager from '@/app/components/Tasks/TaskManager';
import TaskLogs from '@/app/components/Tasks/TaskLogs';
import StatsDashboard from '@/app/components/Statistics/StatsDashboard';
import WidgetManager from '@/app/components/Widgets/WidgetManager';
import KeyboardShortcutsHelp from '@/app/components/KeyboardShortcutsHelp';
import CommandPalette from '@/app/components/CommandPalette';
import Background from '@/app/components/Background';
import Settings from '@/app/components/Settings';
import AmbientMixer from '@/app/components/AmbientMixer';
import QuoteWidget from '@/app/components/Widgets/QuoteWidget';
import CalendarWidget from '@/app/components/Widgets/CalendarWidget';
import NotesWidget from '@/app/components/Widgets/NotesWidget';
import BreathingWidget from '@/app/components/Widgets/BreathingWidget';
import DictionaryWidget from '@/app/components/Widgets/DictionaryWidget';
import DraggableWidget from '@/app/components/Widgets/DraggableWidget';
import { SettingsIcon, Activity, BarChart3, X, Layout, Menu, Keyboard, EyeOff, Eye, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VideoInfo } from '@/app/components/Player';
 
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'auto'>('theme', 'dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [isTopbarHidden, setIsTopbarHidden] = useState(false);
  const [hideBackground, setHideBackground] = useState(false);
  const canTopbarInteract = (!isEditingLayout || !isTopbarHidden) && !isZenMode;
  const { widgets, removeWidget, updateWidget, applyPreset, widgetsLoaded } = useWidgets();
  const { data: session } = useSession();
  const [showWidgetHeaders, setShowWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const [googleCalendarEnabled] = useLocalStorage('googleCalendarEnabled', false);
  const [googleTasksEnabled] = useLocalStorage('googleTasksEnabled', false);
  const grantedScopes = ((session as any)?.scope as string | undefined)?.split(' ') || [];
  const requiredScopes = [
    ...(googleCalendarEnabled ? ['https://www.googleapis.com/auth/calendar.events'] : []),
    ...(googleTasksEnabled ? ['https://www.googleapis.com/auth/tasks'] : []),
  ];
  const needsReauth = requiredScopes.some(sc => !grantedScopes.includes(sc));
  const handleReauth = () => {
    signIn('google', { callbackUrl: '/studio' })
  }; 
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'lg' | 'md' | 'sm' | 'xs' | 'xxs'>('lg');
  const tileW = 1;
  const tileH = 1;
  const capacity = 9;
  const maxRows = 3;
  const [rowHeight, setRowHeight] = useState<number>(60);
  const [rowHeightLS, setRowHeightLS] = useLocalStorage('rowHeight', 60);
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaYRef = useRef<number>(0);
  const [beforeDrag, setBeforeDrag] = useState<any[]>([]);
  const anyModalOpenRender = showSettings || showStats || showLogs || (showWidgetManager && !isEditingLayout);

  useCloudSync();

  const [currentVideo, setCurrentVideo] = useLocalStorage<VideoInfo | null>('currentVideo', null);
  const toast = useToast();
  const lastGridToastRef = useRef<number>(0);
  const lastDragToastRef = useRef<number>(0);
  const defaultGlass = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 0.4 : 0.7;
  const [glassOpacity] = useLocalStorage('glassOpacity', defaultGlass);
  useEffect(() => {
    const globalVal = Math.max(0.25, Math.min(1, glassOpacity));
    const widgetVal = Math.max(0, Math.min(1, glassOpacity));
    document.documentElement.style.setProperty('--glass-opacity', String(globalVal));
    document.documentElement.style.setProperty('--widget-glass-opacity', String(widgetVal));
  }, [glassOpacity]);

  useEffect(() => {
    document.documentElement.setAttribute('data-hide-headers', showWidgetHeaders ? 'false' : 'true');
  }, [showWidgetHeaders]);

  useEffect(() => {
    if (!currentVideo) {
      setCurrentVideo({ id: 'jfKfPfyJRdk', title: 'Lofi Girl Radio', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg' });
    }
  }, [currentVideo]);

  const toggleZenMode = () => {
    setIsZenMode(!isZenMode);
    if (!isZenMode) {
      toast.success('Zen Mode Enabled. Press Esc to exit.', 3000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && e.altKey) {
        toggleZenMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      toast.success('Welcome to LofiStudio! Press Shift + ? for keyboard shortcuts', 6000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    const hasVisited = typeof window !== 'undefined' ? localStorage.getItem('hasVisited') : 'true';
    if (!hasVisited && !session?.user && widgetsLoaded && widgets.length === 0) {
      applyPreset('empty');
    }
  }, [session, widgetsLoaded, widgets.length]);

  useKeyboardShortcuts([
    { key: ',', ctrl: true, callback: () => setShowSettings(!showSettings), description: 'Toggle settings' },
    { key: 's', ctrl: true, callback: () => setShowStats(!showStats), description: 'Toggle statistics' },
    { key: 'l', ctrl: true, callback: () => setShowLogs(!showLogs), description: 'Toggle activity log' },
    { key: '?', shift: true, callback: () => setShowKeyboardHelp(true), description: 'Show keyboard shortcuts' },
    { key: 'e', ctrl: true, callback: () => setIsEditingLayout(!isEditingLayout), description: 'Toggle Edit Layout' },
  ]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showKeyboardHelp) setShowKeyboardHelp(false);
        else if (showSettings) setShowSettings(false);
        else if (showStats) setShowStats(false);
        else if (showLogs) setShowLogs(false);
        else if (showWidgetManager) setShowWidgetManager(false);
        else if (isEditingLayout) setIsEditingLayout(false);
        else if (isZenMode) setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showKeyboardHelp, showSettings, showStats, showLogs, showWidgetManager, isEditingLayout]);

  useEffect(() => {
    const toggle = () => setIsZenMode((prev) => !prev)
    window.addEventListener('toggle-zen-mode', toggle as any)
    return () => window.removeEventListener('toggle-zen-mode', toggle as any)
  }, [])

  useEffect(() => {
    const handler = (e: any) => { try { setHideBackground(!!(e?.detail)); } catch {} }
    window.addEventListener('player:show-video-bg', handler as any)
    return () => window.removeEventListener('player:show-video-bg', handler as any)
  }, [])
  useEffect(() => {
    const toggleEdit = () => setIsEditingLayout((p) => !p)
    const toggleHeaders = () => setShowWidgetHeaders((p: boolean) => !p)
    const reauth = () => handleReauth()
    const openStats = () => setShowStats(true)
    const openLogs = () => setShowLogs(true)
    const openSettingsEv = () => setShowSettings(true)
    const openWM = () => setShowWidgetManager(true)
    window.addEventListener('toggle-edit-layout', toggleEdit as any)
    window.addEventListener('toggle-hide-headers', toggleHeaders as any)
    window.addEventListener('open-reauth', reauth as any)
    window.addEventListener('open-stats', openStats as any)
    window.addEventListener('open-logs', openLogs as any)
    window.addEventListener('open-settings', openSettingsEv as any)
    window.addEventListener('open-widget-manager', openWM as any)
    return () => {
      window.removeEventListener('toggle-edit-layout', toggleEdit as any)
      window.removeEventListener('toggle-hide-headers', toggleHeaders as any)
      window.removeEventListener('open-reauth', reauth as any)
      window.removeEventListener('open-stats', openStats as any)
      window.removeEventListener('open-logs', openLogs as any)
      window.removeEventListener('open-settings', openSettingsEv as any)
      window.removeEventListener('open-widget-manager', openWM as any)
    }
  }, [])

  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('editing-layout-change', { detail: isEditingLayout })); } catch {}
  }, [isEditingLayout])

  useEffect(() => {
    const openWidgetManagerHandler = () => setShowWidgetManager(true);
    window.addEventListener('open-widget-manager', openWidgetManagerHandler);
    return () => window.removeEventListener('open-widget-manager', openWidgetManagerHandler);
  }, []);

  const isDesktop = currentBreakpoint === 'lg';

  useEffect(() => {
    const openSettings = () => setShowSettings(true)
    const openStats = () => setShowStats(true)
    const openLogs = () => setShowLogs(true)
    window.addEventListener('open-settings', openSettings)
    window.addEventListener('open-stats', openStats)
    window.addEventListener('open-logs', openLogs)
    return () => {
      window.removeEventListener('open-settings', openSettings)
      window.removeEventListener('open-stats', openStats)
      window.removeEventListener('open-logs', openLogs)
    }
  }, [])

  useEffect(() => {
    reflowGrid();
  }, []);

  useEffect(() => {
    const GroupSchema = z.object({ rows: z.number().min(1).max(3) });
    const ConfigSchema = z.object({
      groups: z.record(GroupSchema),
      assignments: z.record(z.string()),
    });
    try {
      const parsed = ConfigSchema.safeParse(sizeConfig as any);
      if (!parsed.success) {
        console.warn('Invalid widget size configuration');
      } else {
        const groups = parsed.data.groups;
        const assignments = parsed.data.assignments;
        const invalidAssign = Object.values(assignments).some(v => !(v in groups));
        if (invalidAssign) console.warn('Invalid widget assignments');
      }
    } catch (e) {}
  }, []);

  // Reflow solo al montar; al agregar widgets usamos el primer lugar disponible desde useWidgets

  useEffect(() => {
    const compute = () => {
      const container = typeof document !== 'undefined' ? (document.querySelector('[data-ui="main-grid"]') as HTMLElement) : null;
      const viewport = container ? container.clientHeight : (typeof window !== 'undefined' ? window.innerHeight : 900);
      const dockEl = typeof window !== 'undefined' ? (document.querySelector('[data-ui="edit-dock"]') as HTMLElement) : null;
      const dockH = isEditingLayout ? (dockEl?.offsetHeight ?? 0) : 0;
      const paddingTop = container ? parseFloat(getComputedStyle(container).paddingTop || '0') : 0;
      const paddingBottom = container ? parseFloat(getComputedStyle(container).paddingBottom || '0') : 0;
      const containerPaddingY = paddingTop + paddingBottom;
      const marginY = 12;
      const gaps = marginY * (maxRows - 1);
      const reserved = dockH + containerPaddingY + gaps;
      const units = tileH * maxRows;
      const rh = Math.max(48, Math.floor((viewport - reserved) / units));
      setRowHeight(rh);
      setRowHeightLS(rh);
    };
    const id = setTimeout(compute, 0);
    window.addEventListener('resize', compute);
    return () => { clearTimeout(id); window.removeEventListener('resize', compute); };
  }, [isEditingLayout, tileH, maxRows]);

  useEffect(() => {
    const mql = typeof window !== 'undefined' ? window.matchMedia('(orientation: landscape)') : null as any;
    const init = () => { if (mql) setIsLandscape(!!mql.matches); };
    const handler = (e: any) => setIsLandscape(!!e.matches);
    init();
    mql?.addEventListener?.('change', handler);
    return () => { mql?.removeEventListener?.('change', handler); };
  }, []);

  useEffect(() => {
    const target = (() => {
      if (currentBreakpoint === 'lg') return { cols: 3, rows: 3, cap: 9 };
      if (currentBreakpoint === 'md') return { cols: 3, rows: 3, cap: 9 };
      return { cols: 1, rows: 3, cap: 3 };
    })();
    const ev = new CustomEvent('responsive:capacity', { detail: { capacity: target.cap } });
    window.dispatchEvent(ev);
    if (currentBreakpoint === 'lg' || currentBreakpoint === 'md') return;
    const enabled = widgets.filter(w => w.enabled);
    const heightUnitsFor = (t: string) => {
      const groupName = (sizeConfig.assignments as any)[t] || 'small';
      const rowsFor = (sizeConfig.groups as any)[groupName]?.rows || 1;
      return Math.round(rowsFor * tileH);
    };
    const take = enabled.slice(0, target.cap);
    const colsArr: { id: string; h: number }[][] = Array.from({ length: target.cols }, () => []);
    const totals = Array.from({ length: target.cols }, () => 0);
    const maxUnitsPerCol = target.rows * tileH;
    take.forEach((w, idx) => {
      const desiredH = heightUnitsFor(w.type);
      const order = Array.from({ length: target.cols }, (_, i) => i).sort((a, b) => totals[a] - totals[b]);
      for (const c of order) {
        const requiresTop = desiredH === tileH * target.rows;
        if (totals[c] + desiredH <= maxUnitsPerCol && (!requiresTop || totals[c] === 0)) {
          colsArr[c].push({ id: w.id, h: desiredH });
          totals[c] += desiredH;
          break;
        }
      }
    });
    const updates: { i: string; x: number; y: number; w: number; h: number; minW: number; minH: number; maxW: number; maxH: number }[] = [];
    colsArr.forEach((colItems, colIdx) => {
      let y = 0;
      colItems.forEach((ci) => {
        const x = colIdx * tileW;
        updates.push({ i: ci.id, x, y, w: tileW, h: ci.h, minW: tileW, minH: tileH, maxW: tileW, maxH: tileH * target.rows });
        y += ci.h;
      });
    });
    setGridLayouts((prev: any) => ({ ...prev, [currentBreakpoint]: updates }));
  }, [currentBreakpoint, widgets.length, tileW, tileH]);

  useEffect(() => {
    const anyModalOpen = showSettings || showStats || showLogs || (showWidgetManager && !isEditingLayout);
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSettings, showStats, showLogs, showWidgetManager, isEditingLayout]);

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      if (now - (lastGridToastRef.current || 0) < 1500) return;
      lastGridToastRef.current = now;
      try { toast.warning('Capacidad de la cuadrícula alcanzada. Elimina un widget antes de agregar otro.', 3000); } catch {}
      try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) (navigator as any).vibrate(10); } catch {}
    };
    window.addEventListener('grid-capacity-reached', handler as any);
    return () => window.removeEventListener('grid-capacity-reached', handler as any);
  }, []);

  // Transform widgets to react-grid-layout format
  const typeById = new Map(widgets.map(w => [w.id, w.type] as const));

  const getConstraints = () => ({ minW: tileW, minH: tileH, maxW: tileW, maxH: tileH * maxRows });

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const layout = widgets
    .filter(w => w.enabled && w.layout)
    .map(w => {
      const c = getConstraints();
      const col = Math.floor((w.layout?.x ?? 0) / tileW);
      const row = Math.floor((w.layout?.y ?? 0) / tileH);
      const span = Math.max(1, Math.ceil(((w.layout?.h ?? tileH) / tileH)));
      const x = clamp(col, 0, 2) * tileW;
      let rowClamped = clamp(row, 0, Math.max(0, maxRows - span));
      if (span === 3) rowClamped = 0;
      if (span === 2 && rowClamped > 1) rowClamped = 1;
      const y = rowClamped * tileH;
      const hUnits = clamp(w.layout?.h ?? tileH, tileH, tileH * maxRows);
      return {
        i: w.id,
        x,
        y,
        w: tileW,
        h: hUnits,
        minW: c.minW,
        minH: c.minH,
        maxW: c.maxW,
        maxH: c.maxH,
      };
    });

  const [gridLayouts, setGridLayouts, gridLoaded] = useLocalStorage<any>('gridLayouts', {
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  });

  const validateGridLayouts = (gl: any) => {
    try {
      if (!gl || typeof gl !== 'object') return false;
      const bps = ['lg','md','sm','xs','xxs'];
      for (const bp of bps) {
        const arr = (gl as any)[bp];
        if (!Array.isArray(arr)) return false;
        for (const it of arr) {
          if (!it || typeof it.i !== 'string') return false;
          if (typeof it.x !== 'number' || typeof it.y !== 'number' || typeof it.w !== 'number' || typeof it.h !== 'number') return false;
          if (it.w !== tileW) return false;
          if (it.h < tileH || it.h > tileH * maxRows) return false;
          const span = Math.max(1, Math.ceil((it.h / tileH)));
          const rowIdx = Math.floor(it.y / tileH);
          if (span === 3 && rowIdx !== 0) return false;
          if (span === 2 && rowIdx > 1) return false;
          if (span === 1 && rowIdx > 2) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!gridLoaded) return;
    setGridLayouts({ lg: [], md: [], sm: [], xs: [], xxs: [] });
  }, [gridLoaded]);

  useEffect(() => {
    // No sincronizar posiciones; el orden es por índice del array
  }, [widgets.length]);

  const onLayoutChange = (currentLayout: any[], allLayouts?: any) => {
    if (allLayouts) {
      const next = Object.fromEntries(Object.entries(allLayouts).map(([bp, items]: any) => [
        bp,
        items.map((it: any) => {
          const c = getConstraints();
          const snappedCol = Math.max(0, Math.min(2, Math.floor(it.x / tileW)));
          const span = Math.max(1, Math.ceil((it.h / tileH)));
          let snappedRow = Math.max(0, Math.min(Math.max(0, maxRows - span), Math.floor(it.y / tileH)));
          if (span === 3) snappedRow = 0;
          if (span === 2 && snappedRow > 1) snappedRow = 1;
          const targetX = snappedCol * tileW;
          const targetY = snappedRow * tileH;
          return { ...it, ...c, x: targetX, y: targetY, w: tileW, h: it.h };
        })
      ]));
      setGridLayouts(next);
    }
    if (currentBreakpoint !== 'lg') return;
    currentLayout.forEach((l: any) => {
      const maxColIdx = currentBreakpoint === 'lg' ? 2 : currentBreakpoint === 'md' ? 1 : (isLandscape && currentBreakpoint === 'sm') ? 1 : 0;
      const snappedCol = Math.max(0, Math.min(maxColIdx, Math.floor(l.x / tileW)));
      const span = Math.max(1, Math.ceil((l.h / tileH)));
      const snappedRow = Math.max(0, Math.min(Math.max(0, maxRows - span), Math.floor(l.y / tileH)));
      const targetX = snappedCol * tileW;
      const targetY = Math.min(snappedRow * tileH, Math.max(0, (maxRows - span) * tileH));
      
    });
  };

  const onItemChanged = (_layout: any[], _oldItem: any, newItem: any) => {
    if (currentBreakpoint !== 'lg') return;
    const c = getConstraints();
    const maxColIdx = currentBreakpoint === 'lg' ? 2 : currentBreakpoint === 'md' ? 1 : (isLandscape && currentBreakpoint === 'sm') ? 1 : 0;
    const snappedCol = Math.max(0, Math.min(maxColIdx, Math.round(newItem.x / tileW)));
    const span = Math.max(1, Math.ceil((newItem.h / tileH)));
    const attemptedRow = Math.floor(newItem.y / tileH);
    let snappedRow = Math.max(0, Math.min(Math.max(0, maxRows - span), attemptedRow));
    if (span === 3) snappedRow = 0;
    if (span === 2 && snappedRow > 1) snappedRow = 1;
    let targetX = snappedCol * tileW;
    let targetY = Math.min(snappedRow * tileH, Math.max(0, (maxRows - span) * tileH));
    const draggedId = newItem.i;
    const oldPos = beforeDrag.find((it: any) => it.i === draggedId);
    const constrained = _layout.map((it: any) => ({ ...it, ...c, w: tileW, h: it.h }));
    const occupied = new Set<string>();
    constrained.forEach((it: any) => {
      if (it.i === draggedId) return;
      const s = Math.max(1, Math.ceil((it.h / tileH)));
      for (let k = 0; k < s; k++) occupied.add(`${it.x},${it.y + k * tileH}`);
    });
    const colTotals = [0, 0, 0];
    constrained.forEach((it: any) => {
      if (it.i === draggedId) return;
      const colIdx = Math.max(0, Math.min(maxColIdx, Math.floor(it.x / tileW)));
      const s = Math.max(1, Math.ceil((it.h / tileH)));
      colTotals[colIdx] += s;
    });
    const exceedsColCapacity = colTotals[snappedCol] + span > maxRows;
    const targetCellsFree = (() => {
      for (let k = 0; k < span; k++) {
        if (occupied.has(`${targetX},${targetY + k * tileH}`)) return false;
      }
      return true;
    })();
    if (!targetCellsFree || exceedsColCapacity) {
      let bestCol = snappedCol;
      let bestRow = snappedRow;
      let bestDist = Infinity;
      for (let cIdx = 0; cIdx <= 2; cIdx++) {
        if (colTotals[cIdx] + span > maxRows) continue;
        const candX = cIdx * tileW;
        for (let r = 0; r <= Math.max(0, maxRows - span); r++) {
          if (span === 3 && r !== 0) continue;
          if (span === 2 && r > 1) continue;
          let free = true;
          for (let k = 0; k < span; k++) {
            if (occupied.has(`${candX},${r * tileH + k * tileH}`)) { free = false; break; }
          }
          if (free) {
            const d = Math.abs(cIdx - snappedCol) + Math.abs(r - attemptedRow);
            if (d < bestDist) { bestDist = d; bestCol = cIdx; bestRow = r; }
          }
        }
      }
      snappedRow = bestRow;
      targetX = bestCol * tileW;
      targetY = snappedRow * tileH;
    }
    if (attemptedRow !== snappedRow) {
      const now = Date.now();
      if (now - (lastDragToastRef.current || 0) >= 1200) {
        lastDragToastRef.current = now;
        try { toast.warning(span >= 3 ? 'Este widget ocupa 3 bloques. Solo fila 0 es válida.' : span === 2 ? 'Este widget ocupa 2 bloques. Filas válidas: 0, 1.' : 'Este widget ocupa 1 bloque. Filas válidas: 0, 1, 2.', 2000); } catch {}
        try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) (navigator as any).vibrate(10); } catch {}
      }
    }
    setGridLayouts((prev: any) => ({
      ...prev,
      [currentBreakpoint]: constrained.map((it: any) => (
        it.i === draggedId ? { ...it, x: targetX, y: targetY } : it
      )),
    }));
    // No persistimos coordenadas; el orden lo define el índice del array
    if (currentBreakpoint !== 'lg') return;
  };

  const onDragging = (_layout: any[], _oldItem: any, newItem: any) => {
    if (currentBreakpoint !== 'lg') return;
    const c = getConstraints();
    const maxColIdx = currentBreakpoint === 'lg' ? 2 : currentBreakpoint === 'md' ? 1 : (isLandscape && currentBreakpoint === 'sm') ? 1 : 0;
    const snappedCol = Math.max(0, Math.min(maxColIdx, Math.round(newItem.x / tileW)));
    const span = Math.max(1, Math.ceil((newItem.h / tileH)));
    let snappedRow = Math.max(0, Math.min(Math.max(0, maxRows - span), Math.floor(newItem.y / tileH)));
    if (span === 3) snappedRow = 0;
    if (span === 2 && snappedRow > 1) snappedRow = 1;
    let targetX = snappedCol * tileW;
    let targetY = Math.min(snappedRow * tileH, Math.max(0, (maxRows - span) * tileH));
    const occupied = new Set<string>();
    _layout.forEach((it: any) => {
      if (it.i === newItem.i) return;
      const s = Math.max(1, Math.ceil((it.h / tileH)));
      for (let k = 0; k < s; k++) occupied.add(`${it.x},${it.y + k * tileH}`);
    });
    const colTotals = [0, 0, 0];
    _layout.forEach((it: any) => {
      if (it.i === newItem.i) return;
      const colIdx = Math.max(0, Math.min(maxColIdx, Math.floor(it.x / tileW)));
      const s = Math.max(1, Math.ceil((it.h / tileH)));
      colTotals[colIdx] += s;
    });
    let blocked = false;
    for (let k = 0; k < span; k++) {
      if (occupied.has(`${targetX},${targetY + k * tileH}`)) { blocked = true; break; }
    }
    if (colTotals[snappedCol] + span > maxRows) blocked = true;
    if (blocked) {
      let bestCol = snappedCol;
      let bestRow = snappedRow;
      let bestDist = Infinity;
      const attemptedRow = Math.floor(newItem.y / tileH);
      for (let cIdx = 0; cIdx <= maxColIdx; cIdx++) {
        if (colTotals[cIdx] + span > maxRows) continue;
        const candX = cIdx * tileW;
        for (let r = 0; r <= Math.max(0, maxRows - span); r++) {
          if (span === 3 && r !== 0) continue;
          if (span === 2 && r > 1) continue;
          let free = true;
          for (let k = 0; k < span; k++) {
            if (occupied.has(`${candX},${r * tileH + k * tileH}`)) { free = false; break; }
          }
          if (free) {
            const d = Math.abs(cIdx - snappedCol) + Math.abs(r - attemptedRow);
            if (d < bestDist) { bestDist = d; bestCol = cIdx; bestRow = r; }
          }
        }
      }
      snappedRow = bestRow;
      targetX = bestCol * tileW;
      targetY = snappedRow * tileH;
    }
    setGridLayouts((prev: any) => ({
      ...prev,
      [currentBreakpoint]: _layout.map((it: any) => ({
        ...it,
        ...c,
        w: tileW,
        h: it.h,
        ...(it.i === newItem.i ? { x: targetX, y: targetY } : {})
      }))
    }));
  };

  const handleEditLayoutToggle = () => {
    setIsEditingLayout(!isEditingLayout);
    if (!isEditingLayout) {
      setShowWidgetManager(true);
    } else {
      setShowWidgetManager(false);
    }
  };

  const reflowGrid = () => {
    if ((gridLayouts?.lg?.length || 0) > 0) return;
    const rows = 3;
    const cap = 9;
    const enabled = widgets.filter(w => w.enabled);
    const ordered = [...enabled];
    const clockIdx = ordered.findIndex(w => w.type === 'clock');
    if (clockIdx > -1) {
      const [clk] = ordered.splice(clockIdx, 1);
      ordered.splice(1, 0, clk);
    }
    const heightUnitsFor = (t: string) => {
      const groupName = (sizeConfig.assignments as any)[t] || 'small';
      const rowsFor = (sizeConfig.groups as any)[groupName]?.rows || 1;
      return Math.round(rowsFor * tileH);
    };

    const take = ordered.slice(0, cap);
    const cols: { id: string; type: string; h: number }[][] = [[], [], []];
    const totals = [0, 0, 0];
    const maxUnitsPerCol = rows * tileH;
    take.forEach((w, idx) => {
      const desiredH = heightUnitsFor(w.type);
      const order = [0, 1, 2].sort((a, b) => totals[a] - totals[b]);
      let placed = false;
      for (const c of order) {
        const requiresTop = desiredH === tileH * rows;
        if (totals[c] + desiredH <= maxUnitsPerCol && (!requiresTop || totals[c] === 0)) {
          cols[c].push({ id: w.id, type: w.type, h: desiredH });
          totals[c] += desiredH;
          placed = true;
          break;
        }
      }
      if (!placed) {
        updateWidget(w.id, { enabled: false });
      }
    });
    
    const updates: { i: string; x: number; y: number; w: number; h: number; minW: number; minH: number; maxW: number; maxH: number }[] = [];
    cols.forEach((colItems, colIdx) => {
      let y = 0;
      colItems.forEach((ci) => {
        const wId = ci.id;
        const hUnits = ci.h;
        const x = colIdx * tileW;
        updates.push({ i: wId, x, y, w: tileW, h: hUnits, minW: tileW, minH: tileH, maxW: tileW, maxH: tileH * rows });
        // No persistimos coordenadas; el orden lo define el índice del array
        y += hUnits;
      });
    });
    const constrainedUpdates = updates.map(it => ({ ...it, ...getConstraints() }));
    setGridLayouts({
      lg: constrainedUpdates,
      md: constrainedUpdates,
      sm: constrainedUpdates,
      xs: constrainedUpdates,
      xxs: constrainedUpdates,
    });
    ordered.slice(cap).forEach(w => updateWidget(w.id, { enabled: false }));
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      <main className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-primary/30">
        <TopNavbar />
        <CommandPalette />
        <div className="absolute inset-0 z-0">
          {!hideBackground && <Background />}
        </div>

        {/* Edit Layout Dock */}
        {isEditingLayout && !isZenMode && !isTopbarHidden && (
          <div data-ui="edit-dock" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-4 glass border px-6 py-3 rounded-full shadow-2xl">
              <span className="font-medium text-sm text-foreground">Editing Layout</span>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Grid</span>
                <Button variant="default" size="sm" className="h-8">{(() => {
                  if (currentBreakpoint === 'lg') return '3x3';
                  if (currentBreakpoint === 'md') return '3x3';
                  if (currentBreakpoint === 'sm') return isLandscape ? '2x2' : '1x3';
                  return '1x3';
                })()}</Button>
                <Button disabled variant="ghost" size="sm" className="h-8 cursor-not-allowed opacity-60" title="Free mode (Premium)">Free mode</Button>
              </div>
              <div className="h-4 w-px bg-border" />
            <Button
              onClick={() => setShowWidgetManager(!showWidgetManager)}
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
            >
              <Layout className="w-4 h-4 mr-2" />
              {showWidgetManager ? 'Hide Widgets' : 'Add Widgets'}
            </Button>
            <Button
              onClick={() => setIsTopbarHidden(!isTopbarHidden)}
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
            >
              {isTopbarHidden ? 'Show Topbar' : 'Hide Topbar'}
            </Button>
            <Button
              onClick={() => setIsEditingLayout(false)}
              size="sm"
              variant="secondary"
              className="h-8 rounded-full px-4"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
            </div>
          </div>
        )}

        {isEditingLayout && isTopbarHidden && (
          <div className="fixed top-3 left-3 z-50">
            <Button onClick={() => setIsTopbarHidden(false)} variant="ghost" size="icon" className="h-9 w-9 rounded-full glass border">
              <Eye className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Main Grid Area */}
        <div className={`relative z-10 w-full transition-opacity duration-500`} style={{ height: '100vh', minHeight: '100vh' }} data-ui="main-grid">
          {(() => {
            const cols = currentBreakpoint === 'lg' || currentBreakpoint === 'md' ? 3 : (isLandscape ? 2 : 1);
            const cap = currentBreakpoint === 'lg' || currentBreakpoint === 'md' ? 9 : (isLandscape ? 4 : 3);
            const board = widgets.slice(0, cap);
            const rowsFor = (t: string) => {
              const groupName = (sizeConfig.assignments as any)[t] || 'small';
              const rawRows = (sizeConfig.groups as any)[groupName]?.rows ?? 1;
              const capped = Math.max(1, Math.min(3, rawRows));
              return Math.ceil(capped);
            };
            const sizeToClasses = (s?: string) => {
              if (s === '2x1') return cols === 3 ? 'col-span-1 lg:col-span-2 row-span-1' : cols === 2 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1';
              if (s === '1x2') return 'col-span-1 row-span-2';
              if (s === '2x2') return cols === 3 ? 'col-span-1 lg:col-span-2 row-span-2' : cols === 2 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-2';
              if (s === '1x3') return 'col-span-1 row-span-3';
              if (s === '3x1') return cols === 3 ? 'col-span-1 lg:col-span-3 row-span-1' : 'col-span-1 row-span-1';
              return 'col-span-1 row-span-1';
            };
            return (
              <div
                className={cn('grid gap-3', cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}
                key={currentBreakpoint}
                style={{ gridAutoRows: `${rowHeight}px` }}
              >
                {board.map(widget => {
                  const isSpacer = widget.type === 'SPACER' || !widget.enabled;
                  const rows = rowsFor(widget.type);
                  const fallbackSize = `1x${rows}`;
                  const spanCls = isSpacer ? 'col-span-1 row-span-1' : sizeToClasses(widget.size || fallbackSize);
                  if (isSpacer) {
                    return (
                      <div key={widget.id} className={cn('col-span-1 hidden lg:block', spanCls)}>
                        <div className="opacity-0 h-full w-full" />
                      </div>
                    );
                  }
                  return (
                    <div key={widget.id} className={cn('col-span-1', spanCls)}>
                      <DraggableWidget
                        isEditing={false}
                        onRemove={() => removeWidget(widget.id)}
                        className="h-full"
                      >
                        {widget.type === 'clock' && <ClockWidget />}
                        {widget.type === 'worldtime' && <WorldTimeWidget />}
                        {widget.type === 'weather' && (
                          <WeatherWidget compact={!showWidgetHeaders || rows <= 1 || currentBreakpoint === 'sm' || currentBreakpoint === 'xs' || currentBreakpoint === 'xxs'} />
                        )}
                        {widget.type === 'gif' && <GifWidget />}
                        {widget.type === 'notes' && <NotesWidget />}
                        {widget.type === 'quote' && <QuoteWidget />}
                        {widget.type === 'calendar' && <CalendarWidget />}
                        {widget.type === 'tasks' && <TaskManager />}
                        {widget.type === 'breathing' && <BreathingWidget />}
                        {widget.type === 'dictionary' && <DictionaryWidget />}
                        {widget.type === 'timer' && <PomodoroTimer currentVideo={currentVideo} />}
                      </DraggableWidget>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        {isEditingLayout && (
            <div className="pointer-events-none absolute inset-0 z-20">
              {(() => {
                const cols = currentBreakpoint === 'lg' || currentBreakpoint === 'md' ? 3 : (isLandscape ? 2 : 1);
                const dims = { cols, rows: 3 };
                return (
                  <div className={`h-full w-full grid ${dims.cols === 3 ? 'grid-cols-3' : dims.cols === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-x-3 gap-y-3`}>
                    {Array.from({ length: dims.cols }).map((_, col) => (
                      <div key={col} className="flex flex-col gap-y-3">
                        {Array.from({ length: dims.rows }).map((_, row) => (
                          <div key={`${col}-${row}`} className="rounded-lg border border-white/10 bg-white/5 dark:bg-black/10" style={{ height: `${Math.round(rowHeight * tileH)}px` }} />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        

        {/* Floating Player */}
        <div className={(isEditingLayout || isZenMode) ? 'opacity-0 pointer-events-none transition-opacity' : 'transition-opacity'}>
          <Player currentVideo={currentVideo} setCurrentVideo={setCurrentVideo} />
        </div>

        

        {/* Modals */}
        {!isZenMode && showKeyboardHelp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onTouchStart={(e) => { (touchStartYRef as any).current = e.touches[0]?.clientY || 0; }}
            onTouchMove={(e) => { if ((touchStartYRef as any).current == null) return; (touchDeltaYRef as any).current = (e.touches[0]?.clientY || 0) - ((touchStartYRef as any).current || 0); }}
            onTouchEnd={() => { if (((touchDeltaYRef as any).current || 0) > 80) setShowKeyboardHelp(false); (touchStartYRef as any).current = null; (touchDeltaYRef as any).current = 0; }}
          >
            <KeyboardShortcutsHelp onClose={() => setShowKeyboardHelp(false)} />
          </div>
        )}

        {!isZenMode && showWidgetManager && (
          <div className={`fixed ${isEditingLayout ? 'inset-0 flex items-start justify-end pt-24' : 'inset-0 flex items-center justify-center'} z-50 transition-all duration-300`}>
            <div className={`${isEditingLayout ? 'w-[680px] lg:w-[760px] max-w-[calc(100vw-8px)] glass-panel rounded-2xl p-4 shadow-2xl max-h-[70vh] overflow-y-auto' : 'w-full max-w-4xl glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-bold text-foreground ${isEditingLayout ? 'text-sm' : 'text-2xl'}`}>
                  {isEditingLayout ? 'Add Widgets' : 'Customize Layout'}
                </h2>
                <Button onClick={() => setShowWidgetManager(false)} variant="ghost" size="icon" className="text-foreground hover:bg-black/5 dark:hover:bg-white/10"><X className="w-4 h-4" /></Button>
              </div>
              <WidgetManager />
            </div>
            {/* Backdrop only when not editing */}
            {!isEditingLayout && <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-md" onClick={() => setShowWidgetManager(false)} />}
          </div>
        )}

        {!isZenMode && showSettings && <Settings theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}

        {!isZenMode && showStats && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onTouchStart={(e) => { (touchStartYRef as any).current = e.touches[0]?.clientY || 0; }}
            onTouchMove={(e) => { if ((touchStartYRef as any).current == null) return; (touchDeltaYRef as any).current = (e.touches[0]?.clientY || 0) - ((touchStartYRef as any).current || 0); }}
            onTouchEnd={() => { if (((touchDeltaYRef as any).current || 0) > 80) setShowStats(false); (touchStartYRef as any).current = null; (touchDeltaYRef as any).current = 0; }}
          >
            <div className="w-full max-w-5xl glass-panel rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Your Statistics</h2>
                <Button onClick={() => setShowStats(false)} variant="ghost" size="icon" className="text-foreground"><X /></Button>
              </div>
              <StatsDashboard />
            </div>
          </div>
        )}

        {!isZenMode && showLogs && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onTouchStart={(e) => { (touchStartYRef as any).current = e.touches[0]?.clientY || 0; }}
            onTouchMove={(e) => { if ((touchStartYRef as any).current == null) return; (touchDeltaYRef as any).current = (e.touches[0]?.clientY || 0) - ((touchStartYRef as any).current || 0); }}
            onTouchEnd={() => { if (((touchDeltaYRef as any).current || 0) > 80) setShowLogs(false); (touchStartYRef as any).current = null; (touchDeltaYRef as any).current = 0; }}
          >
            <div className="w-full max-w-2xl glass-panel rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>
                <Button onClick={() => setShowLogs(false)} variant="ghost" size="icon" className="text-foreground"><X /></Button>
              </div>
              <TaskLogs />
            </div>
          </div>
        )}

        {isZenMode && (
          <div className="fixed top-4 right-4 z-[100]">
            <Button onClick={() => setIsZenMode(false)} variant="ghost" size="icon" className="h-9 w-9 rounded-full glass border">
              <Eye className="w-5 h-5" />
            </Button>
            {needsReauth && (
              <Button onClick={handleReauth} variant="secondary" size="sm" className="mt-2 glass border h-8">
                Complete permissions
              </Button>
            )}
          </div>
        )}

        {!isZenMode && !isEditingLayout && !anyModalOpenRender && (
          <div className="fixed bottom-3 right-3 z-[30]">
            <div className="glass-button rounded-full border px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-3">
              <a href="/about" className="hover:text-foreground">About</a>
              <span className="opacity-50">•</span>
              <a href="/legal" className="hover:text-foreground">Legal</a>
              <span className="opacity-50">•</span>
              <a href="/terms" className="hover:text-foreground">Terms</a>
              <span className="opacity-50">•</span>
              <a href="/cookies" className="hover:text-foreground">Cookies Policy</a>
            </div>
            <div className="md:hidden mt-3 flex items-center justify-center gap-3">
              <Button onClick={() => setShowWidgetManager(true)} variant="default" size="icon" className="h-10 w-10 rounded-full">
                <Layout className="w-5 h-5" />
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="secondary" size="icon" className="h-10 w-10 rounded-full">
                <SettingsIcon className="w-5 h-5" />
              </Button>
              <Button onClick={() => setShowStats(true)} variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* CookieConsent is rendered globally in layout.tsx */}

        {!!session?.user && !isZenMode && !localStorage.getItem('privacyNoticeAccepted') && (
          <div className="fixed top-20 right-4 z-[50]">
            <div className="glass-panel rounded-2xl border px-4 py-3 w-[340px]">
              <p className="text-sm font-medium text-foreground">Privacy</p>
              <p className="text-xs text-muted-foreground mt-1">We store the minimum necessary: session and preferences. You can review Legal and Cookies in the footer.</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => localStorage.setItem('privacyNoticeAccepted', 'true')}>Close</Button>
                <Button size="sm" onClick={() => localStorage.setItem('privacyNoticeAccepted', 'true')}>Accept</Button>
              </div>
            </div>
          </div>
        )}

        <AmbientMixer />
      </main>
    </>
  );
}
