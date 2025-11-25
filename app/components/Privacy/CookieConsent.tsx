'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import cookiesConfig from '@/lib/config/cookies.json'

function getConsent() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/ls_cookie_consent=([^;]+)/)
  if (!match) return null
  try { return JSON.parse(decodeURIComponent(match[1])) } catch { return null }
}

function setConsent(val: any) {
  if (typeof document === 'undefined') return
  const oneYear = 365 * 24 * 60 * 60
  document.cookie = `ls_cookie_consent=${encodeURIComponent(JSON.stringify(val))};path=/;max-age=${oneYear};SameSite=Lax`
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState((cookiesConfig as any).defaults.analytics)
  const [preferences, setPreferences] = useState((cookiesConfig as any).defaults.preferences)

  useEffect(() => {
    const current = getConsent()
    if (!current) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-3 left-3 z-[60]">
      <div className="glass-panel rounded-2xl border px-4 py-3 w-[320px]">
        <p className="text-sm font-medium text-foreground">{(cookiesConfig as any).texts.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{(cookiesConfig as any).texts.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">{(cookiesConfig as any).texts.necessaryLabel}</span>
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{(cookiesConfig as any).texts.always}</span>
          </div>
          <button className={`flex items-center justify-between rounded-lg border px-3 py-2 ${analytics ? 'bg-primary/10' : ''}`} onClick={() => setAnalytics(!analytics)} aria-label="Analytics">
            <span className="text-muted-foreground">{(cookiesConfig as any).texts.analytics}</span>
            <span className={`px-2 py-0.5 rounded ${analytics ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{analytics ? 'On' : 'Off'}</span>
          </button>
          <button className={`flex items-center justify-between rounded-lg border px-3 py-2 ${preferences ? 'bg-primary/10' : ''}`} onClick={() => setPreferences(!preferences)} aria-label="Preferences">
            <span className="text-muted-foreground">{(cookiesConfig as any).texts.preferences}</span>
            <span className={`px-2 py-0.5 rounded ${preferences ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{preferences ? 'On' : 'Off'}</span>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setVisible(false) }}>{(cookiesConfig as any).texts.close}</Button>
          <Button size="sm" onClick={() => { setConsent({ necessary: true, analytics, preferences }); setVisible(false) }}>{(cookiesConfig as any).texts.accept}</Button>
        </div>
      </div>
    </div>
  )
}
