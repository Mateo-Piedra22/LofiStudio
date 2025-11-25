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
          <div className="mx-auto mb-6 h-16 w-16 rounded-md overflow-hidden">
            <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-14 md:h-16 w-auto rounded-lg shadow-xl ring-0 ring-white/10 dark:ring-black/20" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">We couldn’t find what you were looking for. Head back to the studio and continue your flow.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
