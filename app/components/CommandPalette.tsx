'use client'

import { useEffect, useRef, useState } from 'react'
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup, CommandShortcut } from '@/components/ui/command'
import { useWidgets } from '@/lib/hooks/useWidgets'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import type { BackgroundConfig } from '@/app/components/Background'
import variants from '@/lib/config/background-variants.json'
import cmdActions from '@/lib/config/command-actions.json'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addWidget, applyPreset, presets, lastPresetId } = useWidgets()
  const [, setBackgroundConfig] = useLocalStorage<BackgroundConfig>('backgroundConfig', { type: 'gradient' })
  const [roomIdx, setRoomIdx] = useLocalStorage('roomVariantIndex', 0)
  const [cafeIdx, setCafeIdx] = useLocalStorage('cafeVariantIndex', 0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput ref={inputRef} placeholder="Type a command or search" />
        <CommandList>
          {(cmdActions as any).quick?.length ? (
            <CommandGroup heading="Quick">
              {(cmdActions as any).quick.map((a: any, idx: number) => (
                <CommandItem key={`${a.label}-${idx}`} onSelect={() => { window.dispatchEvent(new Event(a.event)); setOpen(false) }}>
                  {a.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          <CommandGroup heading="Widgets">
            <CommandItem onSelect={() => { addWidget('clock'); setOpen(false) }}>
              Add Clock
              <CommandShortcut>Ctrl+K</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { addWidget('tasks'); setOpen(false) }}>
              Add Tasks
            </CommandItem>
            <CommandItem onSelect={() => { addWidget('calendar'); setOpen(false) }}>
              Add Calendar
            </CommandItem>
            <CommandItem onSelect={() => { addWidget('weather'); setOpen(false) }}>
              Add Weather
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Background">
            <CommandItem onSelect={() => { const arr = (variants as any).room as Array<{id:string;name:string}>; const idx = Number(roomIdx) % arr.length; setBackgroundConfig({ type: 'video', videoId: arr[idx].id } as any); setOpen(false) }}>
              {(() => { const arr = (variants as any).room as Array<{id:string;name:string}>; const idx = Number(roomIdx) % arr.length; const name = arr[idx]?.name || '—'; return `Room Cozy — current: ${name} (${idx + 1}/${arr.length})` })()}
            </CommandItem>
            <CommandItem onSelect={() => { const arr = (variants as any).room as Array<{id:string;name:string}>; const next = (Number(roomIdx) + 1) % arr.length; setRoomIdx(next); setBackgroundConfig({ type: 'video', videoId: arr[next].id } as any); setOpen(false) }}>
              {(() => { const arr = (variants as any).room as Array<{id:string;name:string}>; const next = (Number(roomIdx) + 1) % arr.length; const name = arr[next]?.name || '—'; return `Next Room Loop — ${name} (${next + 1}/${arr.length})` })()}
            </CommandItem>
            <CommandItem onSelect={() => { const arr = (variants as any).cafe as Array<{id:string;name:string}>; const idx = Number(cafeIdx) % arr.length; setBackgroundConfig({ type: 'video', videoId: arr[idx].id } as any); setOpen(false) }}>
              {(() => { const arr = (variants as any).cafe as Array<{id:string;name:string}>; const idx = Number(cafeIdx) % arr.length; const name = arr[idx]?.name || '—'; return `Cafe Cozy — current: ${name} (${idx + 1}/${arr.length})` })()}
            </CommandItem>
            <CommandItem onSelect={() => { const arr = (variants as any).cafe as Array<{id:string;name:string}>; const next = (Number(cafeIdx) + 1) % arr.length; setCafeIdx(next); setBackgroundConfig({ type: 'video', videoId: arr[next].id } as any); setOpen(false) }}>
              {(() => { const arr = (variants as any).cafe as Array<{id:string;name:string}>; const next = (Number(cafeIdx) + 1) % arr.length; const name = arr[next]?.name || '—'; return `Next Cafe Loop — ${name} (${next + 1}/${arr.length})` })()}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Layout">
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-widget-manager')); setOpen(false) }}>
              Open Widget Manager
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-settings')); setOpen(false) }}>
              Open Settings
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-background-selector')); setOpen(false) }}>
              Open Background Selector
            </CommandItem>
            <CommandItem onSelect={() => { const p = presets.find((x) => x.id === lastPresetId); if (p?.background) setBackgroundConfig(p.background as any); setOpen(false) }}>
              Apply Active Preset Background
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-stats')); setOpen(false) }}>
              Open Statistics
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-logs')); setOpen(false) }}>
              Open Activity Log
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Presets">
            <CommandItem onSelect={() => { applyPreset('minimal'); setOpen(false) }}>
              Apply Minimalist
            </CommandItem>
            <CommandItem onSelect={() => { applyPreset('productive'); setOpen(false) }}>
              Apply Deep Focus
            </CommandItem>
            <CommandItem onSelect={() => { applyPreset('dashboard'); setOpen(false) }}>
              Apply Command Center
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}