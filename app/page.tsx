import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function Page() {
  const loggedIn = await isAuthenticated();
  if (loggedIn) redirect("/timesheets");
  else redirect("/login");
}
