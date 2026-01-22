"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, X, LogIn } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
  redirectTo?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  redirectTo,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect from URL query params or use prop/default
  const redirectDestination = redirectTo || searchParams.get("redirect") || "/hub";

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        setError(
          signInError.message || "Invalid email or password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Success! Close modal and redirect
      onClose();

      // Navigate to destination with a hard reload to ensure cookies are flushed
      const targetPath = redirectDestination.split('?')[0];
      window.location.href = targetPath;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError(null);
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
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Welcome Back</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Sign in to your account
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

          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-12 bg-muted/30 border-border rounded-2xl h-12 text-base"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {onSwitchToForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 space-y-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl gap-2 font-bold shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </Button>

          {onSwitchToSignup && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
