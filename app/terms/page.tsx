import { Metadata } from "next";
import { TermsPageClient } from "@/components/terms-page-client";

export const metadata: Metadata = {
  title: "Terms of Service | Legal & Usage Guidelines | GKP Radio",
  description: "Read our terms of service and usage guidelines. Understand your rights and responsibilities when participating in the GKP Radio community and using our faith-based services.",
  openGraph: {
    title: "Terms of Service | GKP Radio",
    description: "Our legal and usage guidelines for a safe faith-based community.",
    images: ["/logo.png"],
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
