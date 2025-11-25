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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cookies Policy</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>We use necessary cookies for site functionality and authentication. Optionally, you can allow analytics and preferences cookies.</p>
            <p>Types of cookies:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Necessary: session, security, core site functionality.</li>
              <li>Preferences: save theme and local configurations.</li>
              <li>Analytics: usage metrics to improve the product.</li>
            </ul>
            <p>Third-party providers like YouTube and Giphy may set their own cookies according to their policies.</p>
            <p>Management: You can manage your consent from the initial banner or by deleting the `ls_cookie_consent` cookie.</p>
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
