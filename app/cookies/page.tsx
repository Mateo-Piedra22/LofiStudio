'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Cookie, ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Política de Cookies</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Usamos cookies necesarias para el funcionamiento del sitio y autenticación. Opcionalmente, puedes permitir cookies de analíticas y preferencias.</p>
            <p>Tipos de cookies:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Necesarias: sesión, seguridad, funcionamiento básico del sitio.</li>
              <li>Preferencias: guardar tema y configuraciones locales.</li>
              <li>Analíticas: métricas de uso para mejorar el producto.</li>
            </ul>
            <p>Proveedores externos como YouTube y Giphy pueden establecer sus propias cookies según sus políticas.</p>
            <p>Gestión: Puedes gestionar tu consentimiento desde el banner inicial o borrando la cookie `ls_cookie_consent`.</p>
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