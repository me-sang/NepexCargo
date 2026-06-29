import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side guard for auth pages (login, signup, forgot-password flow).
 * If a session exists, send the user home — or to `to` if it's a safe internal
 * path (used to honor `?callbackUrl=…` on /login and /signup).
 */
export async function redirectIfAuthed(to?: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  redirect(isSafeInternalPath(to) ? to : "/");
}

// Anchor `/`, reject `//` and protocol-relative URLs to prevent open-redirects.
function isSafeInternalPath(s: string | undefined): s is string {
  return typeof s === "string" && s.startsWith("/") && !s.startsWith("//");
}
