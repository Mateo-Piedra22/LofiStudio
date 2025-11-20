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
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Acerca de LofiStudio</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>LofiStudio es un espacio de enfoque diseñado por MotionA para potenciar tu productividad con una experiencia estética y funcional. Integra widgets útiles, música lofi, glassmorphism y flujos de trabajo simples.</p>
            <p>La misión de MotionA es crear herramientas digitales que mejoren el rendimiento y bienestar, combinando diseño y tecnología de primer nivel.</p>
            <p>Principios: simplicidad, rendimiento, accesibilidad, y respeto por la privacidad del usuario.</p>
            <p>Contacto: <a href="mailto:contact@motiona.co" className="text-foreground underline">contact@motiona.co</a></p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MotionA</div>
          </div>
        </div>
      </div>
    </main>
  )
}