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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Legal Notice & Privacy</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Owner: MotionA. This site and application are developed and maintained by MotionA.</p>
            <p>Privacy: LofiStudio respects your privacy. Local data is stored in your browser. If you enable Google sync, Google services are used according to your permissions and Google’s policy.</p>
            <p>Cookies: We use strictly necessary and session cookies for authentication and theme preference. No advertising cookies are used.</p>
            <p>Data: With a configured database, profile, sessions, and preferences may be stored. You can request deletion by emailing <a href="mailto:privacy@motiona.co" className="text-foreground underline">privacy@motiona.co</a>.</p>
            <p>Google OAuth: Requires public Terms and Privacy policies. LofiStudio only requests the permissions needed for Calendar and Tasks when you enable them.</p>
            <p>Rights: You can access, rectify, and delete your data. Contact: <a href="mailto:legal@motiona.co" className="text-foreground underline">legal@motiona.co</a>.</p>
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
