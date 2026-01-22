"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart, CreditCard, Lock, CheckCircle2, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { PayPalButton } from "@/components/payments/PayPalButton";

const presetAmounts = [25, 50, 100, 250, 500, 1000];

export default function DonatePage() {
  const [step, setStep] = useState<"amount" | "info" | "payment" | "success">("amount");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    message: "",
    anonymous: false,
    recurring: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const router = useRouter();

  const finalAmount = amount || parseFloat(customAmount) || 0;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(null);
  };

  const handleAmountContinue = () => {
    if (finalAmount > 0) {
      setStep("info");
    }
  };

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!donorInfo.firstName.trim() || !donorInfo.lastName.trim()) {
      return;
    }

    if (!donorInfo.email.trim() || !validateEmail(donorInfo.email)) {
      return;
    }

    setStep("payment");
  };

  const handlePaymentSuccess = () => {
    setStep("success");
    setPaymentError(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setIsProcessing(false);
  };

  const handleBack = () => {
    if (step === "info") {
      setStep("amount");
    } else if (step === "payment") {
      setStep("info");
    }
  };

  if (step === "success") {
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
              Your donation of <span className="font-bold text-secondary">${finalAmount.toFixed(2)}</span> helps us
              continue spreading the message of God&apos;s Kingdom principles.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              A confirmation email has been sent to <strong>{donorInfo.email}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/")}
                className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-8 h-12 font-bold"
              >
                Return Home
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("amount");
                  setAmount(null);
                  setCustomAmount("");
                  setDonorInfo({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    address: "",
                    city: "",
                    state: "",
                    zip: "",
                    country: "United States",
                    message: "",
                    anonymous: false,
                    recurring: false,
                  });
                }}
                className="rounded-xl px-8 h-12 font-bold"
              >
                Make Another Donation
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <Heart className="w-3 h-3" />
            Support Our Ministry
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Make a Donation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous support helps us continue spreading the message of God&apos;s Kingdom
            principles through radio, community, and digital platforms.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
              {step === "amount" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Select Amount</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {presetAmounts.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAmountSelect(preset)}
                          className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${
                            amount === preset
                              ? "border-secondary bg-secondary/5 ring-4 ring-secondary/5 text-secondary"
                              : "border-border bg-muted/30 hover:border-secondary/50 text-foreground"
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="pl-8 bg-muted/30 border-border rounded-2xl h-14 text-lg font-bold"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <Info className="w-6 h-6 text-primary flex-shrink-0" />
                    <p className="text-sm text-primary/80">
                      All donations are tax-deductible. You&apos;ll receive a receipt via email.
                    </p>
                  </div>

                  <Button
                    onClick={handleAmountContinue}
                    disabled={finalAmount <= 0}
                    className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 rounded-xl text-lg font-bold gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {step === "info" && (
                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Donor Information</h2>
                      <p className="text-sm text-muted-foreground">
                        Amount: <span className="font-bold text-secondary">${finalAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <Input
                        required
                        value={donorInfo.firstName}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, firstName: e.target.value })
                        }
                        className="bg-muted/30 border-border rounded-xl"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <Input
                        required
                        value={donorInfo.lastName}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, lastName: e.target.value })
                        }
                        className="bg-muted/30 border-border rounded-xl"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      className="bg-muted/30 border-border rounded-xl"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={donorInfo.phone}
                      onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                      className="bg-muted/30 border-border rounded-xl"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message (Optional)
                    </label>
                    <Textarea
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                      className="bg-muted/30 border-border rounded-xl min-h-[100px]"
                      placeholder="Add a personal message..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {donorInfo.message.length}/500 characters
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={donorInfo.anonymous}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, anonymous: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Make this donation anonymous
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={donorInfo.recurring}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, recurring: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Make this a recurring monthly donation
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 rounded-xl text-lg font-bold gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              )}

              {step === "payment" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Payment Information</h2>
                      <p className="text-sm text-muted-foreground">
                        Amount: <span className="font-bold text-secondary">${finalAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === "stripe"
                          ? "border-secondary bg-secondary/5 ring-4 ring-secondary/5"
                          : "border-border bg-muted/30 hover:border-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === "stripe" ? "text-secondary" : "text-muted-foreground"}`} />
                        <span className={`font-bold ${paymentMethod === "stripe" ? "text-secondary" : "text-foreground"}`}>
                          Credit Card
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === "paypal"
                          ? "border-secondary bg-secondary/5 ring-4 ring-secondary/5"
                          : "border-border bg-muted/30 hover:border-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === "paypal" ? "text-secondary" : "text-muted-foreground"}`} />
                        <span className={`font-bold ${paymentMethod === "paypal" ? "text-secondary" : "text-foreground"}`}>
                          PayPal
                        </span>
                      </div>
                    </button>
                  </div>

                  {paymentError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                      <p className="text-sm text-destructive font-medium">{paymentError}</p>
                    </div>
                  )}

                  {/* Payment Forms */}
                  {paymentMethod === "stripe" ? (
                    <StripePaymentForm
                      amount={finalAmount}
                      donorInfo={{
                        firstName: donorInfo.firstName,
                        lastName: donorInfo.lastName,
                        email: donorInfo.email,
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  ) : (
                    <PayPalButton
                      amount={finalAmount}
                      donorInfo={{
                        firstName: donorInfo.firstName,
                        lastName: donorInfo.lastName,
                        email: donorInfo.email,
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Donation Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/5 border border-secondary/10 rounded-3xl p-8 sticky top-24">
              <h3 className="font-bold text-xl text-foreground mb-6">Donation Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-2xl text-foreground">
                    ${finalAmount.toFixed(2)}
                  </span>
                </div>
                {donorInfo.recurring && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Recurring Monthly</p>
                    <p className="text-xs text-muted-foreground">
                      This donation will be automatically processed each month.
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Your Impact
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your generous donation helps us reach thousands with the message of God&apos;s
                      Kingdom principles through radio, digital platforms, and community outreach.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
