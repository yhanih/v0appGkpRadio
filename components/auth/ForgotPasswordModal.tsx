"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, CheckCircle2, X, ArrowLeft, KeyRound } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await resetPassword(email.trim());

      if (resetError) {
        setError(
          resetError.message || "Failed to send reset email. Please try again."
        );
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Reset Password</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                We&apos;ll send you a reset link
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <p className="text-sm text-secondary font-medium">
                Password reset email sent! Please check your inbox and follow
                the instructions.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-12 bg-muted/30 border-border rounded-2xl h-12 text-base"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 space-y-4">
          {success ? (
            onSwitchToLogin && (
              <Button
                onClick={onSwitchToLogin}
                className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl gap-2 font-bold shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Sign In
              </Button>
            )
          ) : (
            <>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl gap-2 font-bold shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </Button>

              {onSwitchToLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
