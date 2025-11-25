'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-14 md:h-16 w-auto rounded-lg shadow-xl ring-0 ring-white/10 dark:ring-black/20" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">About LofiStudio</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>LofiStudio is a focus sanctuary by MotionA to boost productivity with an aesthetic and functional experience. It blends useful widgets, lofi music, glassmorphism, and simple workflows.</p>
            <p>MotionA’s mission is to build digital tools that improve performance and well-being, combining top-tier design and technology.</p>
            <p>Principles: simplicity, performance, accessibility, and respect for user privacy.</p>
            <p>Contact: <a href="mailto:contact@motiona.co" className="text-foreground underline">contact@motiona.co</a></p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MotionA</div>
          </div>
        </div>
      </div>
    </main>
  )
}
