import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login");
  const isProtectedRoute = path === "/timesheets" || path.startsWith("/timesheets/");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/timesheets", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/timesheets/:path*"],
};
