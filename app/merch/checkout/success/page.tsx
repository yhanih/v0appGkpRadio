"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                image_url
              )
            )
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          {order && (
            <p className="text-sm text-muted-foreground mt-2">
              Order #: {order.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {order && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Order Details
            </h2>

            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="w-16 h-16 rounded-lg bg-muted/30 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.products?.name || "Product"}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="text-secondary">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/merch")}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => router.push("/hub")}
            className="bg-secondary text-white hover:bg-secondary/90 flex-1 sm:flex-none"
          >
            View My Orders
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
