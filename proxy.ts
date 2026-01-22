import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase-middleware";

// Protected routes that require authentication
const protectedRoutes = ["/hub", "/profile"];

// Public routes that should redirect to hub if already authenticated
const authRoutes = ["/auth/login", "/auth/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Update session and get user
  const { supabaseResponse, user } = await updateSession(req);

  console.log(`[Proxy] ${req.method} ${pathname} - User: ${user?.id || 'none'}`);

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // For protected routes, check authentication
  if (isProtectedRoute) {
    if (!user) {
      console.log(`[Proxy] Redirecting unauthenticated user from protected route: ${pathname}`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("auth", "login");
      redirectUrl.searchParams.set("redirect", pathname);

      // IMPORTANT: Must copy updated session cookies to the redirect response
      const response = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    }
  }

  // For auth routes, check if already authenticated and redirect to hub
  if (isAuthRoute) {
    if (user) {
      console.log(`[Proxy] Redirecting authenticated user to /hub from auth route: ${pathname}`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/hub";

      // IMPORTANT: Must copy updated session cookies to the redirect response
      const response = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
