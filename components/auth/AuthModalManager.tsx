"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useAuth } from "@/lib/auth-context";

type AuthModalType = "login" | "signup" | "forgot-password" | null;

interface AuthModalManagerProps {
  children: React.ReactNode;
}

export function AuthModalManager({ children }: AuthModalManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Initialize modalType from URL params on mount
  const [modalType, setModalType] = useState<AuthModalType>(() => {
    const initialAuth = searchParams.get("auth");
    if (initialAuth === "login" || initialAuth === "signup" || initialAuth === "forgot-password") {
      return initialAuth as AuthModalType;
    }
    return null;
  });

  const authParam = searchParams.get("auth");

  // Sync modalType with URL changes
  useEffect(() => {
    if (authParam === "login" || authParam === "signup" || authParam === "forgot-password") {
      if (modalType !== authParam) {
        setModalType(authParam as AuthModalType);
      }
    } else if (!authParam && modalType) {
      // Clear modal if no auth param and modal is open
      setModalType(null);
    }
  }, [authParam, modalType]);

  // Fail-safe: Automatically close modals if user becomes authenticated
  useEffect(() => {
    if (user && modalType) {
      console.log("[AuthModalManager] User authenticated, closing active modal:", modalType);
      closeModal();
    }
  }, [user, modalType]);

  const openModal = (type: AuthModalType) => {
    setModalType(type);
    // Update URL without navigation
    if (type) {
      const url = new URL(window.location.href);
      url.searchParams.set("auth", type);
      window.history.pushState({}, "", url.toString());
    }
  };

  const closeModal = () => {
    setModalType(null);
    // Remove auth param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.pushState({}, "", url.toString());
  };

  const switchToLogin = () => {
    openModal("login");
  };

  const switchToSignup = () => {
    openModal("signup");
  };

  const switchToForgotPassword = () => {
    openModal("forgot-password");
  };

  return (
    <>
      {children}
      <LoginModal
        isOpen={modalType === "login"}
        onClose={closeModal}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={switchToForgotPassword}
      />
      <SignupModal
        isOpen={modalType === "signup"}
        onClose={closeModal}
        onSwitchToLogin={switchToLogin}
      />
      <ForgotPasswordModal
        isOpen={modalType === "forgot-password"}
        onClose={closeModal}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}

// Export hook for opening modals from anywhere
export function useAuthModal() {
  const openLogin = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "login");
    window.history.pushState({}, "", url.toString());
    // Trigger a custom event to update the modal state
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openSignup = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "signup");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openForgotPassword = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "forgot-password");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return { openLogin, openSignup, openForgotPassword };
}
