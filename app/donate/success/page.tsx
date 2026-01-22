"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transaction");

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Thank You for Your Generosity!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {amount ? (
              <>
                Your donation of <span className="font-bold text-secondary">${parseFloat(amount).toFixed(2)}</span> helps us
                continue spreading the message of God&apos;s Kingdom principles.
              </>
            ) : (
              "Your donation helps us continue spreading the message of God's Kingdom principles."
            )}
          </p>
          {transactionId && (
            <p className="text-sm text-muted-foreground mb-8">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            A confirmation email has been sent to your email address with your donation receipt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-8 h-12 font-bold"
            >
              Return Home
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl px-8 h-12 font-bold"
            >
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-2" />
                Make Another Donation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
