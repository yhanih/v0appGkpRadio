import { Metadata } from "next";
import { AboutPageClient } from "@/components/about-page-client";

export const metadata: Metadata = {
  title: "About GKP Radio | Our Mission & Faith Foundation",
  description: "Learn about God Kingdom Principles Radio. Discover our mission to spread the Gospel, our foundational biblical values, and the impact of our global faith community.",
  openGraph: {
    title: "About GKP Radio | Our Mission & Values",
    description: "Learn how GKP Radio is spreading the Gospel through global broadcasting.",
    images: ["/logo.png"],
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
