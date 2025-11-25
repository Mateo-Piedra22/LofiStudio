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
            <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-14 md:h-16 w-auto rounded-lg shadow-xl ring-0 ring-white/10 dark:ring-black/20" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms & Conditions</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>These terms govern your use of LofiStudio, owned by MotionA. By using the service, you agree to these conditions.</p>
            <p>Use: LofiStudio is provided as-is. Illegal use, malicious data extraction, or resale without authorization is not permitted.</p>
            <p>Account: If you authenticate with Google, you’re responsible for keeping your session secure. You can sign out at any time.</p>
            <p>Content: Third-party content (YouTube, Giphy, APIs) is governed by their licenses and policies.</p>
            <p>Liability: MotionA is not liable for indirect damages arising from the use of the service.</p>
            <p>Termination: We may suspend or terminate access in case of abuse or breach.</p>
            <p>Changes: Terms may be updated. We will publish changes and the effective date.</p>
            <p>Contact: <a href="mailto:legal@motiona.co" className="text-foreground underline">legal@motiona.co</a></p>
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
