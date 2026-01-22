# Supabase Auth Maintenance Guide

To ensure that the authentication and session persistence stay stable, follow these rules. These are the "load-bearing" parts of the system.

## 1. File Naming: `proxy.ts`
**Do not rename `proxy.ts` back to `middleware.ts`.**
In this specific project environment, `middleware.ts` is ignored. The server requires `proxy.ts` with an exported function also named `proxy`. 
- **Path**: `web-app/proxy.ts`

## 2. Standardized Cookie Name: `sb-auth-token`
Both the Browser and Server clients **MUST** share the exact same cookie name.
- **Why**: Prevents clashing "poisoned" cookies when working on localhost.
- **Reference**:
  - `lib/supabase-browser.ts` -> `cookieOptions: { name: 'sb-auth-token' }`
  - `lib/supabase-middleware.ts` -> `cookieOptions: { name: 'sb-auth-token' }`

## 3. Localhost vs Production Headers
The `next.config.mjs` file is configured to relax security for local development.
- **HSTS** and **upgrade-insecure-requests** are wrapped in `process.env.NODE_ENV === 'production'`.
- **Warning**: If you enable these on localhost, your browser will block the login cookies because it will try to force HTTPS on a non-HTTPS server.

## 4. Singleton Clients
Always use the getter functions instead of calling `createBrowserClient` or `createServerClient` directly in components.
- Browser: `getSupabaseBrowserClient()`
- Server (Middleware/Actions): `updateSession(request)`

## 5. If Session is Lost
If you ever see "No data showing" after login:
1.  **Clear Cookies**: Delete all `sb-` cookies in your browser.
2.  **Verify Proxy**: Check if the dev server logs show the proxy running when you visit a page.
3.  **Check `.env.local`**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
