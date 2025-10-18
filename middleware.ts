import type { NextRequest } from "next/server";
import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/timesheets/:path*"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
})

export const config = {
  matcher: ["/login", "/timesheets/:path*"],
};
