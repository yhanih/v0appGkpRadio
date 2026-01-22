import { Metadata } from "next";
import { MerchPageClient } from "@/components/merch-page-client";

export const metadata: Metadata = {
  title: "Ministry Store | Support GKP Radio with Faith-Inspired Merch",
  description: "Browse our exclusive collection of GKP Radio apparel, accessories, and media. Support our ministry while sharing God's Kingdom Principles.",
  openGraph: {
    title: "GKP Radio Ministry Store",
    description: "Shop faith-inspired merchandise and support our global broadcasts.",
    images: ["/logo.png"],
  },
};

export default function MerchPage() {
  return <MerchPageClient />;
}
