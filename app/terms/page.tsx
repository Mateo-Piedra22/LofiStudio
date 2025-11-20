'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Términos y Condiciones</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Estos términos regulan tu uso de LofiStudio, propiedad de MotionA. Al usar el servicio, aceptas estas condiciones.</p>
            <p>Uso: LofiStudio se ofrece tal cual. No se permite uso ilícito, extracción de datos maliciosa ni reventa sin autorización.</p>
            <p>Cuenta: Si te autenticas con Google, eres responsable de mantener tu sesión segura. Puedes cerrar sesión en cualquier momento.</p>
            <p>Contenido: El contenido de terceros (YouTube, Giphy, APIs) se rige por sus licencias y políticas.</p>
            <p>Responsabilidad: MotionA no será responsable por daños indirectos derivados del uso del servicio.</p>
            <p>Terminación: Podemos suspender o terminar el acceso ante abuso o incumplimiento.</p>
            <p>Cambios: Los términos pueden actualizarse. Publicaremos cambios y la fecha de vigencia.</p>
            <p>Contacto: <a href="mailto:legal@motiona.co" className="text-foreground underline">legal@motiona.co</a></p>
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