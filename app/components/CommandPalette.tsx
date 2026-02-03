'use client'

import { useEffect, useRef, useState } from 'react'
import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup, CommandShortcut } from '@/components/ui/command'
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store'
import { useBackgroundStore, type BackgroundConfig } from '@/lib/stores/background.store'
import { SCENES } from '@/lib/data/scenes'
import cmdActions from '@/lib/config/command-actions.json'
import type { WidgetType } from '@/lib/types/widget.types'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use new widget grid store
  const addWidget = useWidgetGridStore(state => state.addWidget)
  const applyPreset = useWidgetGridStore(state => state.applyPreset)

  const setBackgroundConfig = useBackgroundStore(state => state.setConfig)
  const currentSceneId = useBackgroundStore(state => state.currentSceneId)
  const [selectedSceneId, setSelectedSceneId] = useState(currentSceneId || SCENES[0]?.id || 'study')

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

  // Helper to add widget with type casting
  const handleAddWidget = (type: WidgetType) => {
    addWidget(type)
    setOpen(false)
  }

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
            <CommandItem onSelect={() => handleAddWidget('clock')}>
              Add Clock
              <CommandShortcut>Ctrl+K</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleAddWidget('tasks')}>
              Add Tasks
            </CommandItem>
            <CommandItem onSelect={() => handleAddWidget('calendar')}>
              Add Calendar
            </CommandItem>
            <CommandItem onSelect={() => handleAddWidget('weather')}>
              Add Weather
            </CommandItem>
            <CommandItem onSelect={() => handleAddWidget('timer')}>
              Add Pomodoro Timer
            </CommandItem>
            <CommandItem onSelect={() => handleAddWidget('notes')}>
              Add Notes
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Background">
            {SCENES.map((scene) => (
              <CommandItem key={scene.id} onSelect={() => { setSelectedSceneId(scene.id); const v = scene.variants[0]; setBackgroundConfig({ type: 'video', videoId: v.youtubeId } as any); setOpen(false) }}>
                {`Set ${scene.name} — ${scene.variants[0]?.name || 'Default'}`}
              </CommandItem>
            ))}
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
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-stats')); setOpen(false) }}>
              Open Statistics
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('open-logs')); setOpen(false) }}>
              Open Activity Log
            </CommandItem>
            <CommandItem onSelect={() => { window.dispatchEvent(new Event('toggle-edit-layout')); setOpen(false) }}>
              Toggle Edit Mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
