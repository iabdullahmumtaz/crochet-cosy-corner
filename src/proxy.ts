import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  const role = token?.kind === "session" ? token.role : null;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }
    if (role !== "admin") {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account") && role !== "customer") {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
