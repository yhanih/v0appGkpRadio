import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance to prevent multiple instances
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase client instance using @supabase/ssr.
 * This is the recommended way for Next.js Apps to handle browser-side auth
 * with cookie synchronization for middleware and server components.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  // Return existing client if it exists
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client using createBrowserClient from @supabase/ssr
  // This automatically syncs auth state with cookies for the middleware
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: 'sb-auth-token', // Consistent naming
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    global: {
      headers: {
        'x-client-info': 'gkp-radio-web-app',
      },
    },
  });

  return supabaseClient;
}
