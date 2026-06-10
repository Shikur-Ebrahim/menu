import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get("nemu-auth")?.value;
  let session: { role?: string; status?: string } | null = null;

  try {
    if (authCookie) session = JSON.parse(decodeURIComponent(authCookie));
  } catch {
    session = null;
  }

  // Protect /dashboard routes — must be approved owner
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "owner") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.status !== "approved") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
  }

  // Protect /admin routes — must be admin role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
