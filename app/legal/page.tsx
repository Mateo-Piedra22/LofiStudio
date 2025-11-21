'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Scale, ArrowLeft } from 'lucide-react'

export default function LegalPage() {
  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-8 py-10 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-14 md:h-16 w-auto rounded-lg shadow-xl ring-0 ring-white/10 dark:ring-black/20" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Aviso Legal y Privacidad</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Titular: MotionA. Este sitio y aplicación están desarrollados y mantenidos por MotionA.</p>
            <p>Privacidad: LofiStudio respeta tu privacidad. Los datos locales se almacenan en tu navegador. Si habilitas la sincronización con cuenta de Google, se utilizarán servicios de Google según tus permisos y la política de Google.</p>
            <p>Cookies: Se usan cookies estrictamente necesarias y de sesión para autenticación y preferencia de tema. No se emplean cookies de publicidad.</p>
            <p>Datos: Con una base de datos configurada, se guardan perfil, sesiones y preferencias. Puedes solicitar eliminación escribiendo a <a href="mailto:privacy@motiona.co" className="text-foreground underline">privacy@motiona.co</a>.</p>
            <p>Google OAuth: Requiere políticas públicas de Términos y Privacidad. LofiStudio solicita únicamente los permisos necesarios para Calendar y Tasks cuando los habilitas.</p>
            <p>Derechos: Puedes acceder, rectificar y eliminar tus datos. Contacto: <a href="mailto:legal@motiona.co" className="text-foreground underline">legal@motiona.co</a>.</p>
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