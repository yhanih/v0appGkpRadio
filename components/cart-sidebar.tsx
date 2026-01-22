"use client";

import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

function CartSidebar() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, getTotalPrice, getItemCount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/merch/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
            {getItemCount() > 0 && (
              <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">
                {getItemCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some items to get started!</p>
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-secondary text-white hover:bg-secondary/90"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted/30 flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-2">{item.name}</h3>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " • "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}
                    <p className="text-lg font-bold text-foreground mb-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-foreground min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-secondary">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 font-bold text-lg gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export { CartSidebar };
export default CartSidebar;
