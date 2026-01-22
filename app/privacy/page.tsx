import { Metadata } from "next";
import { PrivacyPageClient } from "@/components/privacy-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy | Your Data & GKP Radio",
  description: "Learn how GKP Radio protects your personal information. Our privacy policy outlines our data collection, usage, and security practices to ensure your trust and safety.",
  openGraph: {
    title: "Privacy Policy | GKP Radio",
    description: "Our commitment to your privacy and security.",
    images: ["/logo.png"],
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
