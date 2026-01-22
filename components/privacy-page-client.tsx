"use client";

import { Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PrivacyPageClient() {
    return (
        <main className="min-h-screen bg-background pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                        <Shield className="w-3 h-3" />
                        Privacy & Security
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-8">
                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            God Kingdom Principles Radio (&quot;GKP Radio&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-secondary" />
                                    Personal Information
                                </h3>
                                <p className="text-muted-foreground leading-relaxed ml-7">
                                    We collect information that you provide directly to us, including:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-7 mt-2">
                                    <li>Name and email address when you create an account</li>
                                    <li>Profile information (bio, avatar) that you choose to provide</li>
                                    <li>Payment information for donations (processed securely through Stripe/PayPal)</li>
                                    <li>Contact information when you submit forms or contact us</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-secondary" />
                                    Usage Information
                                </h3>
                                <p className="text-muted-foreground leading-relaxed ml-7">
                                    We automatically collect certain information when you use our service:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-7 mt-2">
                                    <li>Device information (browser type, operating system)</li>
                                    <li>IP address and location data</li>
                                    <li>Pages visited and time spent on pages</li>
                                    <li>Interactions with content (prayers, comments, likes)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process donations and send receipts</li>
                            <li>Send you notifications about community activity and ministry updates (with your consent)</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Detect, prevent, and address technical issues and security threats</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">4. Information Sharing and Disclosure</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>
                                <strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf (e.g., payment processing, email delivery)
                            </li>
                            <li>
                                <strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities
                            </li>
                            <li>
                                <strong>Protection of Rights:</strong> We may share information to protect our rights, privacy, safety, or property
                            </li>
                            <li>
                                <strong>With Your Consent:</strong> We may share information with your explicit consent
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Lock className="w-6 h-6 text-secondary" />
                                <h3 className="font-bold text-foreground">Security Measures</h3>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                                <li>Encryption of data in transit (HTTPS/TLS)</li>
                                <li>Secure password storage with hashing</li>
                                <li>Row-level security policies in our database</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication</li>
                            </ul>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">6. Your Rights and Choices</h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Access and update profile information</li>
                            <li>Request deletion of account and data</li>
                            <li>Opt-out of marketing emails</li>
                            <li>Data Portability and Correction</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">7. Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use cookies to improve your experience. You can manage these through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">8. Contact Us</h2>
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                            <p className="text-foreground font-medium mb-2">God Kingdom Principles Radio</p>
                            <p className="text-muted-foreground mb-1">Email: privacy@gkpradio.com</p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/terms">View Terms of Service</Link>
                    </Button>
                    <Button asChild className="bg-secondary text-white hover:bg-secondary/90 rounded-xl">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
