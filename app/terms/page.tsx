'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'

export default function TermsPage() {
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                <p className="text-muted-foreground mt-1">Effective Date: November 25, 2025</p>
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
                Welcome to <strong>LofiStudio</strong>. These Terms of Service ("Terms") govern your access to and use of our website, application, and services (collectively, the "Service").
              </p>
              <p className="text-muted-foreground">
                By accessing or using LofiStudio, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service. 
                LofiStudio is owned and operated by <strong>MotionA</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                1. Use of the Service
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Eligibility:</strong> You must be at least 13 years old to use the Service. By using LofiStudio, you represent and warrant that you meet this requirement.
                </p>
                <p>
                  <strong>License:</strong> MotionA grants you a limited, non-exclusive, non-transferable, and revocable license to use the Service for your personal, non-commercial use, subject to these Terms.
                </p>
                <p>
                  <strong>Prohibited Conduct:</strong> You agree not to:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                  <li>Attempt to bypass or break any security mechanism on the Service.</li>
                  <li>Reverse engineer, decompile, or attempt to extract the source code of the software.</li>
                  <li>Use any robot, spider, scraper, or other automated means to access the Service for any purpose without our express written permission.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-400" />
                2. Intellectual Property
              </h2>
              <p className="text-muted-foreground">
                The Service and its original content (excluding user-provided content), features, and functionality are and will remain the exclusive property of MotionA and its licensors. 
                The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
              </p>
              <p className="text-muted-foreground">
                <strong>Third-Party Content:</strong> LofiStudio integrates content from third-party platforms (e.g., YouTube, Giphy). 
                We do not claim ownership of this content. All rights remain with their respective owners and are used in accordance with their API terms of service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                3. Disclaimer & Limitation of Liability
              </h2>
              <p className="text-muted-foreground italic">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. MotionA makes no representations or warranties of any kind, express or implied, as to the operation of the Service.
              </p>
              <p className="text-muted-foreground">
                In no event shall MotionA, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li>Your access to or use of or inability to access or use the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any content obtained from the Service; and</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-400" />
                4. Changes to Terms
              </h2>
              <p className="text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. 
                What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="text-muted-foreground">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <a href="mailto:legal@motiona.xyz" className="text-primary hover:underline font-medium">
                legal@motiona.xyz
              </a>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MotionA. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/legal" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
