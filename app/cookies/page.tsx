'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Cookie, Settings, Info, ShieldCheck } from 'lucide-react'

export default function CookiesPage() {
  return (
    <main className="min-h-screen w-full relative font-sans selection:bg-primary/30">
      <div className="fixed inset-0 -z-20 bg-[url('/lofistudio-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed" />
      <div className="fixed inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 flex items-start justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-6 md:px-10 py-10 md:py-12 max-w-4xl w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Cookie className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Cookie Policy</h1>
                <p className="text-muted-foreground mt-1">Understanding how we use cookies.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 text-foreground border-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-10 text-foreground/90 leading-relaxed">
            
            <section className="space-y-4">
              <p className="text-lg text-muted-foreground">
                This Cookie Policy explains what cookies are, how <strong>LofiStudio</strong> uses them, and your choices regarding their use. 
                We use cookies to improve your experience, ensure the security of our platform, and understand how our service is used.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-400" />
                What Are Cookies?
              </h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and to provide information to the owners of the site.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-6 h-6 text-yellow-400" />
                Types of Cookies We Use
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-panel border p-5 rounded-xl">
                  <h3 className="font-semibold text-lg text-foreground mb-2">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These are necessary for the website to function and cannot be switched off. They include:
                  </p>
                  <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground">
                    <li><strong>Authentication:</strong> Keeping you logged in securely (e.g., NextAuth session cookies).</li>
                    <li><strong>Security:</strong> Protecting against Cross-Site Request Forgery (CSRF) attacks.</li>
                    <li><strong>Consent:</strong> Remembering your cookie preferences.</li>
                  </ul>
                </div>

                <div className="glass-panel border p-5 rounded-xl">
                  <h3 className="font-semibold text-lg text-foreground mb-2">Functional Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These allow the website to provide enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground">
                    <li><strong>Preferences:</strong> Saving your theme (light/dark), volume levels, and active widgets.</li>
                    <li><strong>Local State:</strong> Storing your task lists and timer settings locally on your browser.</li>
                  </ul>
                </div>

                <div className="glass-panel border p-5 rounded-xl">
                  <h3 className="font-semibold text-lg text-foreground mb-2">Analytics Cookies (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    These help us understand how visitors interact with the website by collecting and reporting information anonymously.
                    We use Vercel Analytics for this purpose. You can opt-out of these at any time.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                Managing Cookies
              </h2>
              <p className="text-muted-foreground">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent banner that appears when you first visit the site.
              </p>
              <p className="text-muted-foreground">
                Additionally, you can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li>View what cookies are stored on your device and delete them individually.</li>
                <li>Block third-party cookies.</li>
                <li>Block cookies from particular sites.</li>
                <li>Block all cookies from being set.</li>
              </ul>
            </section>

            <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="text-xl font-semibold mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about our use of cookies, please email us.
              </p>
              <a href="mailto:privacy@motiona.xyz" className="text-primary hover:underline font-medium">
                privacy@motiona.xyz
              </a>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MotionA. All rights reserved.</p>
            <Link href="/legal" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
