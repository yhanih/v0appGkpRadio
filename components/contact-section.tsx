"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError(null);
    setNewsletterSuccess(false);
    setIsNewsletterSubmitting(true);

    // Email validation
    if (!newsletterEmail.trim()) {
      setNewsletterError("Email is required");
      setIsNewsletterSubmitting(false);
      return;
    }

    if (!validateEmail(newsletterEmail.trim())) {
      setNewsletterError("Please enter a valid email address");
      setIsNewsletterSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNewsletterError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setIsNewsletterSubmitting(false);
      return;
    }

    // Minimal insert: only email. (Avoid assuming extra columns.)
    const { error: insertError } = await supabase
      .from("newslettersubscribers")
      .insert({ email: newsletterEmail.trim() });

    if (insertError) {
      setNewsletterError(insertError.message);
      setIsNewsletterSubmitting(false);
      return;
    }

    setIsNewsletterSubmitting(false);
    setNewsletterSuccess(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Input validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required");
      setIsSubmitting(false);
      return;
    }

    if (subject.length > 200) {
      setError("Subject must be 200 characters or less");
      setIsSubmitting(false);
      return;
    }

    if (!message.trim()) {
      setError("Message is required");
      setIsSubmitting(false);
      return;
    }

    if (message.length > 5000) {
      setError("Message must be 5000 characters or less");
      setIsSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setIsSubmitting(false);
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    const { error: insertError } = await supabase.from("contactmessages").insert({
      name,
      email: email.trim(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      contactreason: "contact",
      status: "unread",
    });

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Contact Info */}
          <div>
            <span className="text-sm font-medium text-secondary uppercase tracking-wider">
              Get In Touch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
              We&apos;d Love to Hear From You
            </h2>
            <p className="text-lg text-muted-foreground mb-10 text-pretty">
              Whether you have a prayer request, testimony to share, or just
              want to connect with our ministry team, we&apos;re here for you.
            </p>

            {/* Contact Details */}
            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  label: "Email Us",
                  value: "contact@gkpradio.com",
                  href: "mailto:contact@gkpradio.com",
                },
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "+1 (555) 123-4567",
                  href: "tel:+15551234567",
                },
                {
                  icon: MapPin,
                  label: "Visit Us",
                  value: "123 Faith Street, Grace City, GC 12345",
                  href: "#",
                },
              ].map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <contact.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {contact.label}
                    </p>
                    <p className="text-foreground font-medium group-hover:text-secondary transition-colors">
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-12 p-6 bg-muted rounded-xl">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Stay updated with program schedules, events, and inspiring
                content.
              </p>
              {newsletterError && (
                <p className="text-sm text-destructive font-medium mb-3">
                  Couldn&apos;t subscribe: {newsletterError}
                </p>
              )}
              {newsletterSuccess && (
                <p className="text-sm text-secondary font-medium mb-3">
                  You&apos;re subscribed. Thank you!
                </p>
              )}
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2"
                suppressHydrationWarning
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-card border-border"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={isNewsletterSubmitting}
                  suppressHydrationWarning
                />
                <Button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isNewsletterSubmitting ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-card rounded-2xl border border-border p-8 sm:p-10">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Send Us a Message
            </h3>

            {error && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-sm text-destructive font-medium">
                  We couldn&apos;t send your message: {error}
                </p>
              </div>
            )}

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Message Sent!
                </h4>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                suppressHydrationWarning
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-background border-border"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-background border-border"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-background border-border"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone (optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="bg-background border-border"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    className="bg-background border-border"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    rows={5}
                    className="bg-background border-border resize-none"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
