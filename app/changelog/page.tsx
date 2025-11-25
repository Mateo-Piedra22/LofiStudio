'use client'

import Link from 'next/link'
import changelog from '@/lib/data/changelog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function compareVersions(a: string, b: string) {
  const pa = a.split('.').map((x) => parseInt(x) || 0)
  const pb = b.split('.').map((x) => parseInt(x) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] || 0
    const db = pb[i] || 0
    if (da > db) return 1
    if (da < db) return -1
  }
  return 0
}

export default function ChangelogPage() {
  const entries = [...changelog].sort((x, y) => compareVersions(y.version, x.version))
  const latestVersion = entries[0]?.version
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="fixed inset-0 -z-20 bg-[url('/lofistudio-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed" />
      <div className="fixed inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 flex items-start justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-6 md:px-8 py-8 md:py-10 max-w-4xl w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-12 w-auto rounded-lg shadow-xl" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">What's New</h1>
            </div>
            <Button asChild variant="secondary" className="hidden md:flex">
              <Link href="/studio">Open Studio</Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {entries.map((item, idx) => (
                <div key={`${item.version}-${idx}`} className="relative">
                  <div className="absolute -left-1 md:-left-0 top-6 w-3 h-3 rounded-full bg-primary shadow" />
                  <div className="glass-panel rounded-2xl border p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                          {item.version === latestVersion && (
                            <Badge className="text-[11px] px-2 py-0.5 bg-primary/20 text-primary">Latest</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">{item.title}</span>
                          <span className="text-sm text-muted-foreground">v{item.version}</span>
                        </div>
                      </div>
                      {item.image && (
                        <div className="w-28 h-16 md:w-40 md:h-24 rounded-lg overflow-hidden border border-border shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-foreground">✨ New Features</div>
                        {item.features.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No new features</p>
                        ) : (
                          <ul className="space-y-1">
                            {item.features.map((f, i) => (
                              <li key={i} className="text-sm text-foreground">{f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-foreground">🐛 Bug Fixes</div>
                        {item.fixes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No fixes</p>
                        ) : (
                          <ul className="space-y-1">
                            {item.fixes.map((f, i) => (
                              <li key={i} className="text-sm text-foreground">{f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link href="/" className="text-xs text-muted-foreground">Back to Home</Link>
            <Link href="/studio" className="text-xs text-muted-foreground">Go to Studio</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
