import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/timesheets"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value; // 👈 read your auth cookie

  // Check if the route is protected
  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // If it's a protected route and user is not logged in
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname); // optional redirect param
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

// Apply middleware only on relevant routes
export const config = {
  matcher: ["/timesheets/:path*"],
};
