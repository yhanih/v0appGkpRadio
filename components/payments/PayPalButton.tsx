"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  donorInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PayPalButton({ amount, donorInfo, onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""}&currency=USD`;
    script.async = true;
    script.onload = () => {
      setLoading(false);
      if (window.paypal && paypalRef.current) {
        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
            },
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toFixed(2),
                      currency_code: "USD",
                    },
                    description: "Donation to GKP Radio",
                  },
                ],
                application_context: {
                  brand_name: "GKP Radio",
                  landing_page: "BILLING",
                  user_action: "PAY_NOW",
                },
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const order = await actions.order.capture();
                // Redirect to success page
                window.location.href = `/donate/success?amount=${amount}&transaction=${order.id}`;
              } catch (error: any) {
                onError(error.message || "Payment failed");
              }
            },
            onError: (err: any) => {
              onError(err.message || "PayPal payment failed");
            },
            onCancel: () => {
              onError("Payment cancelled");
            },
          })
          .render(paypalRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, donorInfo, onSuccess, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-muted/30 rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-secondary" />
          <span className="font-bold text-foreground">PayPal Payment</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pay securely with your PayPal account or credit card.
        </p>
        <div ref={paypalRef} className="min-h-[200px]" />
      </div>
    </div>
  );
}
