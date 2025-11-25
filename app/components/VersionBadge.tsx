'use client'

import changelog from '@/lib/data/changelog'
import { Badge } from '@/components/ui/badge'

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

export default function VersionBadge() {
  const latest = [...changelog].sort((x, y) => compareVersions(y.version, x.version))[0]
  const v = latest?.version ? `v${latest.version}` : 'v1.0.0'
  return (
    <Badge variant="outline" className="px-2 py-0.5 text-[11px] bg-background/40 border-border">
      {v}
    </Badge>
  )
}
