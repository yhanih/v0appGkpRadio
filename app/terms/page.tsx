"use client";

import { FileText, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <FileText className="w-3 h-3" />
            Legal
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By accessing and using God Kingdom Principles Radio (&quot;GKP Radio&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) website and services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on GKP Radio&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material (&quot;Content&quot;). You are responsible for the Content that you post on or through the service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree that your Content will not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon the rights of others, including intellectual property rights</li>
              <li>Contain defamatory, libelous, or offensive material</li>
              <li>Contain spam, malware, or malicious code</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">5. Prohibited Uses</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may not use our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The service and its original content, features, and functionality are and will remain the exclusive property of GKP Radio and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">7. Donations and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All donations made through our service are final and non-refundable unless required by law. We reserve the right to refuse or cancel any donation at any time for any reason.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree to provide current, complete, and accurate purchase and account information for all donations made through our service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you wish to terminate your account, you may simply discontinue using the service or contact us to delete your account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">9. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, GKP Radio excludes all representations, warranties, and conditions relating to our website and the use of this website.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nothing in this disclaimer will limit or exclude our liability for death or personal injury resulting from negligence, limit or exclude our liability for fraud or fraudulent misrepresentation, or limit any of our liabilities in any way that is not permitted under applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In no event shall GKP Radio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which GKP Radio operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
              <p className="text-foreground font-medium mb-2">God Kingdom Principles Radio</p>
              <p className="text-muted-foreground">Email: contact@gkpradio.com</p>
              <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
          <Button asChild className="bg-secondary text-white hover:bg-secondary/90 rounded-xl">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
