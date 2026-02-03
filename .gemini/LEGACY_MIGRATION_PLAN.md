# LofiStudio Legacy → V2 Complete Migration Plan

## Status: 🔄 IN PROGRESS

**Last Updated**: 2026-02-03
**Total Phases**: 6
**Estimated Items**: ~35

---

## Overview

Complete migration of all remaining legacy systems to V2 architecture:
- Unified Zustand stores with persistence
- Full TypeScript typing
- Modular component architecture
- Elimination of direct `useLocalStorage` usage
- Removal of all `.legacy` directories

---

# PHASE A: Settings Store Foundation ✅

Create unified settings management system.

## A.1 Types & Store
- [x] Create `lib/types/settings.types.ts` - Global settings types
- [x] Create `lib/stores/settings.store.ts` - Unified settings store

## A.2 Settings Component Modularization
- [x] Create `app/components/SettingsV2/` directory
- [x] Create `SettingsV2/GeneralSettings.tsx` - Theme, language, appearance
- [x] Create `SettingsV2/TimerSettings.tsx` - Pomodoro durations
- [x] Create `SettingsV2/IntegrationSettings.tsx` - Google Calendar/Tasks
- [x] Create `SettingsV2/DataSettings.tsx` - Export/Import/Clear
- [x] Create `SettingsV2/BackgroundSettings.tsx` - Background config
- [x] Create `SettingsV2/Settings.tsx` - Main orchestrator
- [x] Create `SettingsV2/index.ts` - Barrel exports

## A.3 Integration
- [x] Update `StudioClient.tsx` to use SettingsV2
- [x] Remove legacy `Settings/index.tsx` dependency

---

# PHASE B: Timer & Statistics Integration ✅

Integrate PomodoroTimer with Statistics V2 store.

## B.1 Timer Store
- [x] Create `lib/stores/timer.store.ts` - Timer state with durations
- [x] Integrate with `statistics.store.ts` for session logging

## B.2 Timer Component Update
- [x] Refactor `Timer/PomodoroTimer.tsx` to use:
  - `useTimerStore` instead of `useLocalStorage`
  - `useStatisticsStore` instead of `useStatistics` hook

## B.3 Deprecate Legacy
- [ ] Mark `lib/hooks/useStatistics.ts` as deprecated
- [ ] Mark `lib/hooks/useTimer.ts` as deprecated (if applicable)

---

# PHASE C: Tasks System Consolidation ⏳

Consolidate legacy Tasks components with TasksV2.

## C.1 Enhance TasksV2
- [ ] Review `Tasks/TaskManager.tsx` for missing features
- [ ] Migrate any unique features to `TasksV2/TaskList.tsx`
- [ ] Review `Tasks/TaskLogs.tsx` for activity log features
- [ ] Ensure `TaskDetail.tsx` covers TaskLogs functionality

## C.2 Update Consumers
- [ ] Update `StudioClient.tsx` to use TasksV2 components
- [ ] Update any widget using `useTaskManager` to use `useTaskStore`

## C.3 Deprecate Legacy
- [ ] Mark `lib/hooks/useTaskManager.ts` as deprecated
- [ ] Mark `app/components/Tasks/` directory as deprecated

---

# PHASE D: Statistics Views Consolidation ⏳

Replace legacy Statistics components with StatisticsV2.

## D.1 Enhance StatisticsV2
- [ ] Review `Statistics/StatsDashboard.tsx` for missing features
- [ ] Ensure `StatisticsV2/StatsOverview.tsx` covers all features
- [ ] Review `Statistics/ActivityChart.tsx` - ensure V2 version complete
- [ ] Review `Statistics/ProductivityHeatmap.tsx` - ensure V2 version complete
- [ ] Review `Statistics/StatsCard.tsx` - ensure covered in V2

## D.2 Update Consumers
- [ ] Update `StudioClient.tsx` to use `StatisticsV2/StatsOverview`

## D.3 Deprecate Legacy
- [x] Mark `app/components/Statistics/` directory as deprecated

---

# PHASE E: Background System Migration ✅

Migrate Background components to use V2 store.

## E.1 Refactor Background Component
- [x] Update `Background/index.tsx` to use `useBackgroundStore`
- [x] Update `Background/BackgroundSelector.tsx` to use `useBackgroundStore`
- [x] Remove all `useLocalStorage` calls from Background components

## E.2 Integration
- [x] Ensure SettingsV2 BackgroundSettings uses `useBackgroundStore`

---

# PHASE F: Final Cleanup & Verification ✅

Remove all deprecated code and verify build.

## F.1 Delete Legacy Directories
- [x] Delete `app/components/Widgets.legacy/` directory
- [x] Delete `app/components/Player/` directory
- [x] Delete `app/components/AmbientMixer.legacy/` directory
- [x] Delete `app/components/Statistics/` directory
- [x] Delete `app/components/Tasks/` directory
- [x] Delete or rename `app/components/Settings/` (now Settings V2 is in use)

## F.2 Delete Deprecated Hooks
- [x] Delete or rename `lib/hooks/useTaskManager.ts`
- [x] Delete or rename `lib/hooks/useStatistics.ts`
- [ ] Clean up `lib/hooks/index.ts` exports (optional, legacy hooks renamed)

## F.3 Update Root Components
- [x] Final cleanup of `StudioClient.tsx`
- [x] Final cleanup of `TopNavbar.tsx`
- [ ] Final cleanup of `ThemeProvider.tsx`
- [x] Final cleanup of `CommandPalette.tsx`

## F.4 Verification
- [x] TypeScript compilation check
- [x] Full build verification
- [x] No remaining references to legacy hooks
- [x] No remaining `useLocalStorage` calls in main components

---

# Files Summary

## Files to Create
| File | Status |
|------|--------|
| `lib/types/settings.types.ts` | ⏳ |
| `lib/stores/settings.store.ts` | ⏳ |
| `lib/stores/timer.store.ts` | ⏳ |
| `app/components/SettingsV2/GeneralSettings.tsx` | ⏳ |
| `app/components/SettingsV2/TimerSettings.tsx` | ⏳ |
| `app/components/SettingsV2/IntegrationSettings.tsx` | ⏳ |
| `app/components/SettingsV2/DataSettings.tsx` | ⏳ |
| `app/components/SettingsV2/BackgroundSettings.tsx` | ⏳ |
| `app/components/SettingsV2/Settings.tsx` | ⏳ |
| `app/components/SettingsV2/index.ts` | ⏳ |

## Files to Delete
| File/Directory | Status |
|----------------|--------|
| `app/components/Widgets.legacy/` | ⏳ |
| `app/components/Player/` | ⏳ |
| `app/components/AmbientMixer.legacy/` | ⏳ |
| `app/components/Statistics/` | ⏳ |
| `app/components/Tasks/` | ⏳ |

## Files to Refactor
| File | Status |
|------|--------|
| `app/components/Timer/PomodoroTimer.tsx` | ⏳ |
| `app/components/Background/index.tsx` | ⏳ |
| `app/components/Background/BackgroundSelector.tsx` | ⏳ |
| `app/components/Studio/StudioClient.tsx` | ⏳ |
| `app/components/TopNavbar.tsx` | ⏳ |
| `app/components/ThemeProvider.tsx` | ⏳ |
| `app/components/CommandPalette.tsx` | ⏳ |

---

# Legend

- ⏳ Pending
- 🔄 In Progress  
- ✅ Complete
- ❌ Blocked
