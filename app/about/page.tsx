"use client";

import { Heart, BookOpen, Users, Globe, Radio, Mic, Music, Calendar, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: Heart,
    title: "Faith-Centered",
    description:
      "Every broadcast is rooted in biblical principles and designed to strengthen your relationship with God.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    description:
      "In-depth studies and expository teachings that help you understand and apply God's Word.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join a global family of believers united in faith, prayer, and the pursuit of God's kingdom.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Broadcasting to listeners worldwide, bringing the message of hope to every corner of the earth.",
  },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To proclaim the transformative message of Jesus Christ through powerful teaching, uplifting music, and Spirit-filled programming that equips believers and reaches the lost.",
  },
  {
    icon: Heart,
    title: "Our Vision",
    description:
      "To be a beacon of hope and truth, transforming lives through the power of God's Word and building a global community of believers committed to Kingdom principles.",
  },
  {
    icon: Award,
    title: "Our Values",
    description:
      "We are committed to biblical integrity, authentic community, servant leadership, and excellence in all we do, always putting God's Kingdom first.",
  },
];

const programs = [
  {
    icon: Mic,
    title: "Teaching Programs",
    description: "In-depth biblical studies and expository teachings",
  },
  {
    icon: Music,
    title: "Worship & Music",
    description: "Uplifting worship music and praise sessions",
  },
  {
    icon: Radio,
    title: "Live Broadcasting",
    description: "24/7 live programming with real-time interaction",
  },
  {
    icon: Calendar,
    title: "Special Events",
    description: "Conferences, revivals, and special ministry events",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
              <Radio className="w-3 h-3" />
              About GKP Radio
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
              Spreading the Gospel Through the Airwaves
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              God Kingdom Principles Radio is dedicated to proclaiming the transformative message
              of Jesus Christ to listeners around the world. Through powerful teaching, uplifting
              music, and Spirit-filled programming, we aim to equip believers and reach the lost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-8 h-12 font-bold">
                <Link href="/donate">Support Our Mission</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-8 h-12 font-bold">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-3xl p-8 border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Foundation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on biblical principles and a heart for God&apos;s Kingdom
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-3xl p-8 border border-border shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Programs */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Programs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Diverse programming designed to inspire, teach, and transform
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border hover:border-secondary/50 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <program.icon className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-bold text-lg text-foreground mb-2">{program.title}</h4>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 sm:py-32 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "24/7", label: "Broadcasting" },
              { value: "150+", label: "Countries Reached" },
              { value: "1M+", label: "Monthly Listeners" },
              { value: "10+", label: "Years of Ministry" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-secondary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary text-white rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                Join Us in Spreading the Gospel
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Your support helps us reach more people with the message of God&apos;s Kingdom
                principles. Together, we can transform lives and build God&apos;s Kingdom.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-white text-secondary hover:bg-white/90 rounded-xl px-8 h-12 font-bold"
                >
                  <Link href="/donate">Make a Donation</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-12 font-bold"
                >
                  <Link href="/contact">Partner With Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
