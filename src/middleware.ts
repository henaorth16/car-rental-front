import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/bookings", "/admin", "/profile"];
  const authRoutes = ["/login", "/register"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Only check session when needed
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  // Call the better-auth session endpoint on the backend — forward cookies
  let isAuthenticated = false;
  try {
    const sessionRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      }
    );
    // better-auth returns the session object when authenticated, null when not
    const session = await sessionRes.json();
    isAuthenticated = !!session?.user;
  } catch {
    isAuthenticated = false;
  }

  // Not logged in → redirect to login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(`/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → send away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/cars";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: [
//     "/bookings/:path*",
//     "/admin/:path*",
//     "/profile/:path*",
//     "/login",
//     "/register",
//   ],
// };