import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/utils/cookies";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ message: "Logged out successfully" });
}
