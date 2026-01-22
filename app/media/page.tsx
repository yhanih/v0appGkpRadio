import { Metadata } from "next";
import { MediaPageClient } from "@/components/media-page-client";

export const metadata: Metadata = {
    title: "Media Library | Podcasts, Sermons & Worship Videos | GKP Radio",
    description: "Explore our collection of inspiring podcasts, spiritual sermons, and worship videos. Discern Divine Principles through faith-based media.",
    openGraph: {
        title: "Media Library | GKP Radio",
        description: "Explore inspiring podcasts, sermons, and worship videos.",
        images: ["/logo.png"],
    },
};

export default function MediaPage() {
    return <MediaPageClient />;
}
