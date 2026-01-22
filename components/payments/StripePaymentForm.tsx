"use client";

import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, AlertCircle } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripePaymentFormProps {
  amount: number;
  donorInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  amount,
  donorInfo,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/success`,
          receipt_email: donorInfo.email,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Redirect to success page
        window.location.href = `/donate/success?amount=${amount}&transaction=${paymentIntent.id}`;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      onError(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="p-6 bg-muted/30 rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-secondary" />
          <span className="font-bold text-foreground">Secure Payment</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Your payment information is encrypted and secure. We accept all major credit
          cards, debit cards, and digital wallets.
        </p>
        <PaymentElement />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Secured by Stripe - Industry-standard encryption</span>
      </div>

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 rounded-xl text-lg font-bold gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Complete Donation ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export function StripePaymentForm({
  amount,
  donorInfo,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency: "usd",
            donorInfo,
            recurring: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initialize payment");
        }

        const { clientSecret: secret } = await response.json();
        setClientSecret(secret);
      } catch (err: any) {
        console.error("Error creating payment intent:", err);
        setError(err.message || "Failed to initialize payment");
        onError(err.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, donorInfo, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing secure payment...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive font-medium">
          {error || "Failed to initialize payment. Please try again."}
        </p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#AC9258",
        colorBackground: "transparent",
        colorText: "hsl(var(--foreground))",
        colorDanger: "hsl(var(--destructive))",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        donorInfo={donorInfo}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
