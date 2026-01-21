"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

  const ensureUserProfile = async (authUser: User) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.error("Supabase client not available");
        return;
      }

      // Check if user already exists first
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      // If check fails due to RLS, try to proceed anyway (user might exist)
      if (checkError && !checkError.message?.includes('permission denied')) {
        console.warn("Error checking existing user:", checkError.message);
      }

      const userData = {
        id: authUser.id,
        email: authUser.email!,
        fullname: authUser.user_metadata?.full_name || null,
      };

      let result;
      if (existingUser) {
        // Update existing user
        result = await supabase
          .from("users")
          .update({
            email: authUser.email!,
            fullname: authUser.user_metadata?.full_name || null,
          })
          .eq("id", authUser.id);
      } else {
        // Insert new user - use upsert as fallback if INSERT policy missing
        result = await supabase
          .from("users")
          .upsert(userData, {
            onConflict: "id",
            ignoreDuplicates: false
          });
      }

      if (result.error) {
        // Extract error properties safely - handle cases where error object doesn't serialize well
        let errorMessage = "Unknown error";
        let errorCode = "unknown";
        
        // Try multiple ways to extract error message
        try {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error.message) {
            errorMessage = result.error.message;
          } else if ((result.error as any)?.error_description) {
            errorMessage = (result.error as any).error_description;
          } else {
            // Try to stringify the error
            const errorStr = JSON.stringify(result.error);
            if (errorStr && errorStr !== '{}') {
              errorMessage = errorStr;
            } else {
              // Last resort: convert to string
              errorMessage = String(result.error);
            }
          }
        } catch {
          errorMessage = String(result.error);
        }
        
        // Try to extract error code
        try {
          errorCode = result.error.code || 
                     (result.error as any)?.status?.toString() || 
                     (result.error as any)?.error_code ||
                     "unknown";
        } catch {
          errorCode = "unknown";
        }
        
        // Handle AbortError (cancelled requests) - these are not critical
        const errorName = (result.error as any)?.name || result.error?.constructor?.name;
        if (errorName === 'AbortError' || errorMessage?.includes('aborted') || errorMessage?.includes('AbortError')) {
          // Silently ignore abort errors - they're usually from component unmounting or rapid requests
          return;
        }
        
        // Handle RLS policy errors gracefully
        const isRLSError = errorCode === '42501' || 
                          errorCode === '42P17' ||
                          errorMessage.toLowerCase().includes('permission denied') || 
                          errorMessage.toLowerCase().includes('policy') ||
                          errorMessage.toLowerCase().includes('row-level security') ||
                          errorMessage.toLowerCase().includes('rls') ||
                          errorMessage.toLowerCase().includes('infinite recursion') ||
                          errorMessage.toLowerCase().includes('new row violates');
        
        if (isRLSError) {
          console.warn("User profile upsert blocked by RLS policy. This is expected if INSERT policy is not yet applied:", {
            message: errorMessage,
            code: errorCode,
            hint: "Run the INSERT policy migration in Supabase SQL editor"
          });
          // Don't throw - this is a configuration issue, not a critical error
          return;
        }
        
        // Only log meaningful errors (skip empty objects and abort errors)
        if (errorMessage && errorMessage !== '[object Object]' && errorMessage !== '{}' && errorMessage !== 'Unknown error') {
          const errorInfo: Record<string, any> = {
            message: errorMessage,
            code: errorCode,
            name: errorName,
            errorType: typeof result.error,
            errorConstructor: result.error?.constructor?.name || 'Unknown'
          };
          
          // Try to extract additional properties if they exist
          const errorObj = result.error as any;
          const commonProps = ['details', 'hint', 'status', 'statusText', 'error_description', 'error_code'];
          commonProps.forEach(prop => {
            try {
              if (errorObj?.[prop] !== undefined && errorObj[prop] !== null) {
                errorInfo[prop] = errorObj[prop];
              }
            } catch {
              // Skip if can't access
            }
          });
          
          console.error("Error upserting user profile:", errorInfo);
        }
      }
    } catch (error: any) {
      // Handle unexpected errors
      const errorMessage = error?.message || String(error);
      const errorStack = error?.stack;
      
      // Don't log empty error objects
      if (errorMessage && errorMessage !== '[object Object]') {
        console.error("Error ensuring user profile:", {
          message: errorMessage,
          stack: errorStack,
          type: error?.constructor?.name || typeof error
        });
      } else {
        // If error is not serializable, log what we can
        console.error("Error ensuring user profile (non-serializable):", {
          type: typeof error,
          constructor: error?.constructor?.name,
          keys: error ? Object.keys(error) : []
        });
      }
    }
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      console.warn("[AuthContext] Supabase client not available");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let sessionRestored = false;

    // Get initial session - this restores from localStorage
    const restoreSession = async () => {
      try {
        console.log("[AuthContext] Restoring session from storage...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error("[AuthContext] Error restoring session:", error);
          // Continue anyway - user might not be logged in
        }

        console.log("[AuthContext] Session restored:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
        });

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await ensureUserProfile(session.user);
        }
        
        sessionRestored = true;
        setLoading(false);
      } catch (error) {
        console.error("[AuthContext] Unexpected error restoring session:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Listen for auth state changes (sign in, sign out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed:", {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
      });

      if (!isMounted) return;

      // Only update state if session was already restored, or if this is a new sign-in
      if (sessionRestored || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === "SIGNED_IN") {
          await ensureUserProfile(session.user);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: { message: "Supabase client not available" } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        await ensureUserProfile(data.user);
      }

      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: { message: "Supabase client not available" } };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/reset-password`,
        },
      });

      if (!error && data.user) {
        await ensureUserProfile(data.user);
      }

      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase client not available");
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: { message: "Supabase client not available" } };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return { error: { message: "Supabase client not available" } };
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      return { error };
    } catch (error) {
      console.error("Error updating password:", error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
