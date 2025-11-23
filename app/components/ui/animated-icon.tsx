  "use client"
import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

type FallbackIcon = React.ComponentType<{ className?: string }>

const Lottie = dynamic(() => import('lottie-react').then(m => m.default), { ssr: false })

class Boundary extends React.Component<React.PropsWithChildren<{ fallback: React.ReactNode }>, { hasError: boolean }> {
  constructor(props: { fallback: React.ReactNode }) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(): { hasError: boolean } { return { hasError: true } }
  componentDidCatch(): void {}
  render(): React.ReactNode { if (this.state.hasError) return this.props.fallback; return this.props.children }
}

export default function AnimatedIcon({ animationSrc, fallbackIcon: Fallback, className }: { animationSrc: string; fallbackIcon: FallbackIcon; className?: string }) {
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState(false)
  const fallback = useMemo(() => <Fallback className={className} />, [Fallback, className])
  useEffect(() => {
    let active = true
    setError(false)
    setData(null)
    const load = async () => {
      try {
        const r = await fetch(animationSrc, { cache: 'force-cache' })
        if (!r.ok) throw new Error('bad status')
        const json = await r.json()
        if (!active) return
        if (!json || typeof json !== 'object') throw new Error('invalid json')
        setData(json)
      } catch {
        if (active) setError(true)
      }
    }
    load()
    return () => { active = false }
  }, [animationSrc])
  if (error || !data) return fallback
  return (
    <Boundary fallback={fallback}>
      <Lottie animationData={data} loop autoplay className={className} />
    </Boundary>
  )
}
