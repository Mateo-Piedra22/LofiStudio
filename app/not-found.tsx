'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Ghost, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-xl w-full text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Ghost className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Página no encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">No pudimos encontrar lo que buscabas. Regresa al estudio y continúa tu flujo.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
