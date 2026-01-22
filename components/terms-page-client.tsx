"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TermsPageClient() {
    return (
        <main className="min-h-screen bg-background pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

                <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-8">
                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By accessing and using God Kingdom Principles Radio (&quot;GKP Radio&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) website and services, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">2. Use License</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Permission is granted to temporarily access the materials on GKP Radio&apos;s website for personal, non-commercial transitory viewing only. You may not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose</li>
                            <li>Attempt to reverse engineer any software contained on the website</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            When you create an account, you must provide accurate information. You are responsible for safeguarding your password and account activity.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">4. User Content</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You are responsible for the Content that you post on or through the service. You agree that your Content will not violate any laws or infringe upon the rights of others.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">5. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            The service and its original content, features, and functionality are the exclusive property of GKP Radio and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">6. Donations</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            All donations made through our service are final and non-refundable unless required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">7. Contact Information</h2>
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                            <p className="text-foreground font-medium mb-2">God Kingdom Principles Radio</p>
                            <p className="text-muted-foreground">Email: contact@gkpradio.com</p>
                        </div>
                    </section>
                </div>

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
