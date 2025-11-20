'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-xl w-full text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Algo salió mal</h1>
          <p className="mt-2 text-sm text-muted-foreground truncate">{error?.message || 'Error inesperado'}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}