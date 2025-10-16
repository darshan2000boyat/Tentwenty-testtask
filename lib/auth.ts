import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return !!token;
}
