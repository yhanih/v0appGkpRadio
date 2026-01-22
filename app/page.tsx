import { HeroSection } from "@/components/hero-section";
import { LiveCommunityBar } from "@/components/live-community-bar";
import { QuickPrayerSection } from "@/components/quick-prayer-section";
import { MinistryFieldsSection } from "@/components/ministry-fields-section";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <HeroSection />
      <LiveCommunityBar />
      <QuickPrayerSection />
      <MinistryFieldsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
