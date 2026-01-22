import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key from environment
// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "usd", donorInfo, recurring = false } = body;

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum donation is $1.00" },
        { status: 400 }
      );
    }

    // Check for Stripe key at runtime
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Payment configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        firstName: donorInfo?.firstName || "",
        lastName: donorInfo?.lastName || "",
        donor_name: `${donorInfo?.firstName || ""} ${donorInfo?.lastName || ""}`.trim(),
        email: donorInfo?.email || "",
        donor_email: donorInfo?.email || "",
        phone: donorInfo?.phone || "",
        message: donorInfo?.message || "",
        anonymous: donorInfo?.anonymous ? "true" : "false",
        recurring: recurring ? "true" : "false",
        userId: donorInfo?.userId || "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
