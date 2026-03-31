import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    // Protected routes
    const protectedRoutes = ["/bookings", "/admin", "profile"];

    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // If not logged in → redirect
    // if (isProtected && !token) {
    //     return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    // }

    // If logged in and tries to access login/register → redirect to cars
    if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && token) {
        return NextResponse.redirect(new URL(pathname, request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/admin/:path*", "/profile/:path*", "/login", "/register"],
};