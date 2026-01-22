import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Save donation to database
    try {
      const supabase = getSupabaseServerClient();
      
      // Extract donor information from metadata
      const metadata = paymentIntent.metadata || {};
      const donorName = metadata.donorName || 
        (metadata.firstName && metadata.lastName 
          ? `${metadata.firstName} ${metadata.lastName}` 
          : null);
      
      // Insert donation record
      const { data, error } = await supabase
        .from("donations")
        .insert({
          user_id: metadata.userId || null,
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          currency: paymentIntent.currency.toUpperCase(),
          payment_method: "stripe",
          payment_intent_id: paymentIntent.id,
          donor_name: donorName || null,
          donor_email: metadata.email || paymentIntent.receipt_email || null,
          donor_phone: metadata.phone || null,
          message: metadata.message || null,
          anonymous: metadata.anonymous === "true",
          recurring: metadata.recurring === "true",
          status: "completed",
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving donation to database:", error);
        // Don't fail the webhook - payment already succeeded
        // Log error for manual review
      } else {
        console.log("Donation saved successfully:", data.id);
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      // Don't fail the webhook - payment already succeeded
    }
  }

  // Handle payment_intent.payment_failed for tracking failed payments
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    try {
      const supabase = getSupabaseServerClient();
      
      const metadata = paymentIntent.metadata || {};
      
      // Try to find existing donation record by payment_intent_id
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_intent_id", paymentIntent.id)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from("donations")
          .update({ status: "failed" })
          .eq("id", existing.id);
      } else {
        // Create new record with failed status
        await supabase
          .from("donations")
          .insert({
            user_id: metadata.userId || null,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            payment_method: "stripe",
            payment_intent_id: paymentIntent.id,
            donor_email: metadata.email || paymentIntent.receipt_email || null,
            status: "failed",
          });
      }
    } catch (error) {
      console.error("Error tracking failed payment:", error);
    }
  }

  return NextResponse.json({ received: true });
}
