import { NextRequest, NextResponse } from "next/server";

// Define protected and public routes
const protectedRoutes = ["/workspace"];
const publicRoutes = ["/sign-in", "/sign-up"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Try to get session from cookie (optimistic check)
  try {
    const sessionCookie = req.cookies.get("better-auth.session_token");
    const hasSession = !!sessionCookie?.value;

    // Redirect to /sign-in if accessing protected route without session
    if (isProtectedRoute && !hasSession) {
      return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
    }

    // Redirect to /workspace if accessing public auth routes with session
    if (isPublicRoute && hasSession) {
      return NextResponse.redirect(new URL("/workspace", req.nextUrl));
    }
  } catch {
    // If there's an error checking session, redirect to sign-in for protected routes
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
