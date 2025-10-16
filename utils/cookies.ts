"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
