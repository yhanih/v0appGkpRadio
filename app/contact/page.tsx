"use client";

import { ContactSection } from "@/components/contact-section";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
              <Mail className="w-3 h-3" />
              Get In Touch
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              We&apos;d Love to Hear From You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you have a prayer request, testimony to share, or just want to connect with
              our ministry team, we&apos;re here for you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Additional Info Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">
                Send us an email and we&apos;ll get back to you as soon as possible.
              </p>
              <a
                href="mailto:contact@gkpradio.com"
                className="text-secondary hover:text-secondary/80 font-medium transition-colors"
              >
                contact@gkpradio.com
              </a>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-4">
                Speak directly with our ministry team during business hours.
              </p>
              <a
                href="tel:+15551234567"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                +1 (555) 123-4567
              </a>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Office Hours</h3>
              <p className="text-muted-foreground mb-4">
                Our team is available to assist you during these times.
              </p>
              <div className="text-sm text-foreground font-medium">
                <p>Monday - Friday</p>
                <p>9:00 AM - 5:00 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "How can I submit a prayer request?",
                answer:
                  "You can submit prayer requests through our contact form, community page, or by calling our prayer line. All requests are kept confidential and lifted up in prayer by our ministry team.",
              },
              {
                question: "How do I become a partner or sponsor?",
                answer:
                  "We welcome partnerships! Please contact us through the form above or email us directly at partnerships@gkpradio.com to discuss partnership opportunities.",
              },
              {
                question: "Can I share my testimony?",
                answer:
                  "Absolutely! We love hearing testimonies of how God has worked in your life. Share your story through our community page or contact us directly.",
              },
              {
                question: "How can I support the ministry financially?",
                answer:
                  "You can make a one-time or recurring donation through our secure donation page. All donations are tax-deductible and help us continue spreading the Gospel.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-secondary/50 transition-colors"
              >
                <h3 className="font-bold text-lg text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
