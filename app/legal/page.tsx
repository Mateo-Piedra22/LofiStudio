'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react'

export default function LegalPage() {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                <p className="text-muted-foreground mt-1">Last updated: November 2025</p>
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
                At <strong>LofiStudio</strong> (developed and maintained by <strong>MotionA</strong>), we believe that privacy is a fundamental human right. 
                This Privacy Policy outlines clearly and transparently how we collect, use, and protect your information when you use our platform.
              </p>
              <p className="text-muted-foreground">
                Our core philosophy is simple: <strong>we only collect what is strictly necessary</strong> to provide you with a seamless and personalized experience. 
                We do not sell your personal data to advertisers or third parties.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel border p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-lg">Data We Collect</h3>
                </div>
                <ul className="list-disc ml-5 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Account Information:</strong> If you sign in via Google, we receive your name, email address, and profile picture to create your user profile.</li>
                  <li><strong>Usage Data:</strong> We may collect anonymous analytics (via Vercel Analytics) to understand how our features are used and improve performance.</li>
                  <li><strong>Local Preferences:</strong> Settings like theme, volume, and task lists are stored locally on your device or synced securely if logged in.</li>
                </ul>
              </div>

              <div className="glass-panel border p-6 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-lg">How We Use Data</h3>
                </div>
                <ul className="list-disc ml-5 space-y-2 text-sm text-muted-foreground">
                  <li>To provide and maintain the Service.</li>
                  <li>To allow you to personalize your workspace (widgets, backgrounds, sounds).</li>
                  <li>To sync your settings across devices (for authenticated users).</li>
                  <li>To detect and prevent technical issues or security breaches.</li>
                </ul>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-6 h-6 text-purple-400" />
                Third-Party Services
              </h2>
              <p className="text-muted-foreground">
                LofiStudio integrates with trusted third-party services to enhance your experience. These services may collect their own data governed by their respective privacy policies:
              </p>
              <ul className="list-disc ml-5 space-y-2 text-muted-foreground">
                <li>
                  <strong>Google Services (YouTube, Calendar, Tasks):</strong> We use Google APIs to display videos and sync your productivity tools. 
                  We adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener" className="text-primary hover:underline">Google API Services User Data Policy</a>.
                </li>
                <li>
                  <strong>Giphy:</strong> Used for displaying GIFs in widgets.
                </li>
                <li>
                  <strong>OpenWeatherMap:</strong> Used to provide local weather updates based on your location (if granted).
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-6 h-6 text-yellow-400" />
                Your Rights
              </h2>
              <p className="text-muted-foreground">
                You maintain full control over your data. Under applicable laws (including GDPR and CCPA), you have the right to:
              </p>
              <ul className="list-disc ml-5 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Rectification:</strong> Correct any inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request the permanent deletion of your account and associated data ("Right to be Forgotten").</li>
                <li><strong>Withdraw Consent:</strong> Revoke permissions for Google integration or other services at any time.</li>
              </ul>
            </section>

            <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-4">
              <h3 className="text-xl font-semibold">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact our Data Protection Officer:
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-foreground font-medium">MotionA Privacy Team</span>
                <a href="mailto:privacy@motiona.xyz" className="text-primary hover:underline font-medium">
                  privacy@motiona.xyz
                </a>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MotionA. All rights reserved.</p>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
