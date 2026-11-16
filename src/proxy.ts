import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    "/bookings",
    "/admin",
    "/management",
    "/agent",
    "/profile",
    "/management/apply",
    "/become-agent",
  ];

  const managementRoutes = ["/admin", "/management", "/agent"];

  const authRoutes = [
    "/login",
    "/register",
    "/management/login",
    "/management/register",
    "/agent/login",
  ];

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isProtected =
    !isAuthRoute &&
    protectedRoutes.some((route) => pathname.startsWith(route));

  const isManagementRoute = managementRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Skip if not needed
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  // Fetch session once
  let isAuthenticated = false;
  let role: string | undefined;

  try {
    const sessionRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      },
    );

    const session = await sessionRes.json();

    isAuthenticated = !!session?.user;

    const roleFromSessionCustom = session?.session?.custom?.role;
    const roleFromRootCustom = session?.custom?.role;
    const roleFromUser = session?.user?.role;
    role = roleFromSessionCustom ?? roleFromRootCustom ?? roleFromUser;
  } catch {
    isAuthenticated = false;
  }

  const normalizedRole = String(role ?? "").toUpperCase();

  // 🚫 Not logged in → redirect
  if (isProtected && !isAuthenticated) {
    const loginPath =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/management") ||
      pathname.startsWith("/agent")
        ? "/management/login"
        : "/login";

    if (pathname === loginPath) {
      return NextResponse.next();
    }

    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // 🔐 Role-based protection
  if (isManagementRoute && isAuthenticated) {
    const isAgentOrAdmin =
      normalizedRole === "AGENT" || normalizedRole === "ADMIN";

    const isAdminOnlyRoute = pathname.startsWith("/admin/users");

    // ❌ Not agent/admin
    if (!isAgentOrAdmin) {
      return NextResponse.redirect(new URL("/cars", request.url));
    }

    // ❌ Not admin for admin-only route
    if (isAdminOnlyRoute && normalizedRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 🔁 Already logged in → block auth pages
  if (isAuthRoute && isAuthenticated) {
    const defaultRedirect = pathname.startsWith("/management/")
      ? "/management"
      : pathname.startsWith("/agent/")
      ? "/management"
      : "/cars";

    const redirectUrl =
      request.nextUrl.searchParams.get("redirect") || defaultRedirect;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/bookings/:path*",
    "/admin/:path*",
    "/management/:path*",
    "/agent/:path*",
    "/profile/:path*",
    "/management/apply",
    "/become-agent",
    "/login",
    "/register",
    "/management/login",
    "/management/register",
    "/agent/login",
  ],
};