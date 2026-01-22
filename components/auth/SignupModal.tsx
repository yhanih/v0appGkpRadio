"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  X,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        fullName.trim()
      );

      if (signUpError) {
        setError(
          signUpError.message || "Failed to create account. Please try again."
        );
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Create Account</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                Join our community
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

          {success && (
            <div className="rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <p className="text-sm text-secondary font-medium">
                Account created! Please check your email to verify.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="pl-12 bg-muted/30 border-border rounded-2xl h-12 text-base"
                required
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-12 bg-muted/30 border-border rounded-2xl h-12 text-base"
                required
                autoComplete="new-password"
              />
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Password must contain:
                </p>
                <ul className="text-xs space-y-1">
                  {[
                    { check: password.length >= 8, text: "At least 8 characters" },
                    { check: /[A-Z]/.test(password), text: "One uppercase letter" },
                    { check: /[a-z]/.test(password), text: "One lowercase letter" },
                    { check: /[0-9]/.test(password), text: "One number" },
                  ].map((req, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        req.check ? "text-secondary" : "text-muted-foreground"
                      }`}
                    >
                      {req.check ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>{req.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pl-12 bg-muted/30 border-border rounded-2xl h-12 text-base"
                required
                autoComplete="new-password"
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-destructive">
                Passwords do not match
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 space-y-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
            className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl gap-2 font-bold shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
