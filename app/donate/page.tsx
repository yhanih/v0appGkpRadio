import { Metadata } from "next";
import { DonatePageClient } from "@/components/donate-page-client";

export const metadata: Metadata = {
  title: "Support Our Ministry | Donate to GKP Radio",
  description: "Support God Kingdom Principles Radio in spreading the message of faith and truth. Your donations help us maintain our global broadcasting, community programs, and outreach efforts.",
  openGraph: {
    title: "Support GKP Radio | Make a Donation",
    description: "Help us spread the Gospel through global radio and community support.",
    images: ["/logo.png"],
  },
};

export default function DonatePage() {
  return <DonatePageClient />;
}
