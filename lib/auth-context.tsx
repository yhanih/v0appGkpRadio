"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase-browser";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // Profile synchronization helper
  const ensureUserProfile = async (authUser: User) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: existingUser } = await supabase.from("users").select("id").eq("id", authUser.id).maybeSingle();
      const userData = { id: authUser.id, email: authUser.email!, fullname: authUser.user_metadata?.full_name || null };

      if (existingUser) {
        await supabase.from("users").update({ email: authUser.email!, fullname: authUser.user_metadata?.full_name || null }).eq("id", authUser.id);
      } else {
        await supabase.from("users").upsert(userData, { onConflict: "id" });
      }
    } catch (e) {
      console.warn("[AuthContext] Passive profile sync error:", e);
    }
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const init = async () => {
      console.log("[AuthContext] Initializing session check...");

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (isMounted) {
          if (initialSession) {
            console.log("[AuthContext] Found active session", { userId: initialSession.user.id });
            setSession(initialSession);
            setUser(initialSession.user);
            ensureUserProfile(initialSession.user);
            setLoading(false);
          } else {
            // GRACE PERIOD: If no session found immediately, check if we have the auth cookie
            // If we have a cookie, wait a moment for the internal state machine to catch up
            const hasAuthCookie = document.cookie.includes('sb-auth-token');
            if (hasAuthCookie) {
              console.log("[AuthContext] Cookie detected but no session - waiting for state sync...");
              // Give it 800ms to resolve before giving up
              setTimeout(async () => {
                if (!isMounted) return;
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                if (retrySession) {
                  console.log("[AuthContext] Delayed session sync successful", { userId: retrySession.user.id });
                  setSession(retrySession);
                  setUser(retrySession.user);
                } else {
                  console.log("[AuthContext] Delayed sync failed - staying guest");
                }
                setLoading(false);
              }, 800);
            } else {
              console.log("[AuthContext] No session or cookie found - guest mode active");
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("[AuthContext] Initialization error:", err);
        if (isMounted) setLoading(false);
      }
    };

    init();

    // Listen for state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[AuthContext] State change: ${event}`, { userId: currentSession?.user?.id || 'none' });

      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === "SIGNED_IN" && currentSession?.user) {
        ensureUserProfile(currentSession.user);
      }

      // Safety: settle loading state if an event fires (Supabase resolved its internal state)
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: { message: "Client unavailable" } };
    const r = await supabase.auth.signInWithPassword({ email, password });
    if (!r.error && r.data.user) ensureUserProfile(r.data.user);
    return { error: r.error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: { message: "Client unavailable" } };
    const r = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/reset-password` },
    });
    if (!r.error && r.data.user) ensureUserProfile(r.data.user);
    return { error: r.error };
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
  };

  const resetPassword = (email: string) => getSupabaseBrowserClient()?.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` }) ?? Promise.resolve({ error: { message: "Client unavailable" } });
  const updatePassword = (password: string) => getSupabaseBrowserClient()?.auth.updateUser({ password }) ?? Promise.resolve({ error: { message: "Client unavailable" } });

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
