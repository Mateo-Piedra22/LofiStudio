'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'

function getConsent() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/ls_cookie_consent=([^;]+)/)
  if (!match) return null
  try { return JSON.parse(decodeURIComponent(match[1])) } catch { return null }
}

export default function ConsentAnalytics() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const c = getConsent()
    setOk(!!c?.analytics)
  }, [])
  if (!ok) return null
  return <Analytics />
}