import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase client instance.
 * This prevents multiple GoTrueClient instances which cause AbortErrors.
 * 
 * NOTE:
 * We intentionally do NOT throw at module-evaluation time because Next may import this file
 * during build/prerender even though it is used from client components.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  
  // Return existing client if it exists
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // Create new client only once with explicit storage configuration
  // Explicitly use localStorage to ensure consistent session persistence
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce", // Use PKCE flow for better security
      // Explicitly use localStorage for session persistence
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-client-info': 'gkp-radio-web-app',
      },
    },
  });

  // Validate and clean up session on client creation (only in browser)
  if (typeof window !== 'undefined') {
    // Check if there's a stored session and validate it
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn("[SupabaseClient] Error getting initial session:", error);
        // Clear potentially corrupted session
        supabaseClient.auth.signOut({ scope: 'local' }).catch(() => {
          // Ignore errors during cleanup
        });
      } else if (session) {
        // Validate session hasn't expired
        const expiresAt = session.expires_at;
        if (expiresAt && expiresAt * 1000 < Date.now()) {
          console.warn("[SupabaseClient] Session expired, clearing...");
          supabaseClient.auth.signOut({ scope: 'local' }).catch(() => {
            // Ignore errors during cleanup
          });
        }
      }
    }).catch((err) => {
      console.warn("[SupabaseClient] Error validating session:", err);
    });
  }
  
  return supabaseClient;
}

