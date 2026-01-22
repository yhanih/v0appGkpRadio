import { Metadata } from "next";
import { ContactPageClient } from "@/components/contact-page-client";

export const metadata: Metadata = {
  title: "Contact Us | GKP Radio Ministry Team",
  description: "Get in touch with God Kingdom Principles Radio. Reach out for prayer requests, share your testimony, inquire about partnerships, or ask any questions about our ministry and programming.",
  openGraph: {
    title: "Contact GKP Radio | We'd Love to Hear From You",
    description: "Connect with our ministry team for prayer, testimonies, and inquiries.",
    images: ["/logo.png"],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
