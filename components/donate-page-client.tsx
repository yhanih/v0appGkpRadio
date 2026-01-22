"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { PayPalButton } from "@/components/payments/PayPalButton";

const presetAmounts = [25, 50, 100, 250, 500, 1000];

export function DonatePageClient() {
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
        if (!donorInfo.firstName.trim() || !donorInfo.lastName.trim() || !donorInfo.email.trim() || !validateEmail(donorInfo.email)) {
            return;
        }
        setStep("payment");
    };

    const handlePaymentSuccess = () => {
        setStep("success");
        setPaymentError(null);
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
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => router.push("/")} className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-8 h-12 font-bold">
                                Return Home
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
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                        <Heart className="w-3 h-3" />
                        Support Our Ministry
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                        Make a Donation
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
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
                                                    onClick={() => handleAmountSelect(preset)}
                                                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${amount === preset
                                                            ? "border-secondary bg-secondary/5 text-secondary"
                                                            : "border-border bg-muted/30 hover:border-secondary/50 text-foreground"
                                                        }`}
                                                >
                                                    ${preset}
                                                </button>
                                            ))}
                                        </div>
                                        <Input
                                            type="number"
                                            placeholder="Enter custom amount"
                                            value={customAmount}
                                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                                            className="bg-muted/30 border-border rounded-2xl h-14 text-lg font-bold"
                                        />
                                    </div>
                                    <Button onClick={handleAmountContinue} disabled={finalAmount <= 0} className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 rounded-xl text-lg font-bold">
                                        Continue
                                    </Button>
                                </div>
                            )}

                            {step === "info" && (
                                <form onSubmit={handleInfoSubmit} className="space-y-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <button type="button" onClick={() => setStep("amount")} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-2xl font-bold text-foreground">Donor Information</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Input required placeholder="First Name" value={donorInfo.firstName} onChange={(e) => setDonorInfo({ ...donorInfo, firstName: e.target.value })} />
                                        <Input required placeholder="Last Name" value={donorInfo.lastName} onChange={(e) => setDonorInfo({ ...donorInfo, lastName: e.target.value })} />
                                    </div>
                                    <Input type="email" required placeholder="Email Address" value={donorInfo.email} onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })} />
                                    <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 rounded-xl text-lg font-bold">
                                        Continue to Payment
                                    </Button>
                                </form>
                            )}

                            {step === "payment" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <button type="button" onClick={() => setStep("info")} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-2xl font-bold text-foreground">Payment Information</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod("stripe")}
                                            className={`p-4 rounded-2xl border-2 ${paymentMethod === "stripe" ? "border-secondary bg-secondary/5" : "border-border"}`}
                                        >
                                            Credit Card
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("paypal")}
                                            className={`p-4 rounded-2xl border-2 ${paymentMethod === "paypal" ? "border-secondary bg-secondary/5" : "border-border"}`}
                                        >
                                            PayPal
                                        </button>
                                    </div>
                                    {paymentMethod === "stripe" ? (
                                        <StripePaymentForm
                                            amount={finalAmount}
                                            donorInfo={{ firstName: donorInfo.firstName, lastName: donorInfo.lastName, email: donorInfo.email }}
                                            onSuccess={handlePaymentSuccess}
                                            onError={setPaymentError}
                                        />
                                    ) : (
                                        <PayPalButton
                                            amount={finalAmount}
                                            donorInfo={{ firstName: donorInfo.firstName, lastName: donorInfo.lastName, email: donorInfo.email }}
                                            onSuccess={handlePaymentSuccess}
                                            onError={setPaymentError}
                                        />
                                    )}
                                    {paymentError && <p className="text-destructive text-sm mt-4">{paymentError}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-secondary/5 border border-secondary/10 rounded-3xl p-8 sticky top-24">
                            <h3 className="font-bold text-xl text-foreground mb-6">Donation Summary</h3>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold text-2xl text-foreground">${finalAmount.toFixed(2)}</span>
                            </div>
                            <div className="pt-6 border-t border-border flex items-start gap-3">
                                <Heart className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Your donation help us continue spreading the message of God&apos;s Kingdom principles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
