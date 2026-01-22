import React from "react"
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FloatingAudioPlayer } from "@/components/floating-audio-player";
import { AudioPlayerProvider } from "@/lib/audio-player-context";
import { AppAuthProvider } from "@/components/auth-provider";
import { AuthModalManager } from "@/components/auth/AuthModalManager";
import { CartProvider } from "@/lib/cart-context";
import { CartSidebar } from "@/components/cart-sidebar";
import { Toaster } from "sonner";
import "@/lib/error-handler"; // Suppress AbortErrors
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "God Kingdom Principles Radio | Faith-Based Broadcasting",
  description:
    "Experience uplifting Christian radio with inspiring messages, worship music, and teachings that strengthen your faith journey.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#203E3F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only enable Vercel Analytics when explicitly opted-in to avoid CSP errors in dev
  const enableAnalytics =
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" &&
    process.env.NODE_ENV === "production";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <AppAuthProvider>
          <AuthModalManager>
            <CartProvider>
              <AudioPlayerProvider>
                <Header />
                {children}
                <FloatingAudioPlayer />
                <Footer />
                <CartSidebar />
              </AudioPlayerProvider>
            </CartProvider>
          </AuthModalManager>
        </AppAuthProvider>
        <Toaster position="top-center" richColors />
        {enableAnalytics ? <Analytics /> : null}
      </body>
    </html>
  );
}
