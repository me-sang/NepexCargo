import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side guard for auth pages (login, signup, forgot-password flow).
 * If a session exists, send the user home before the page renders.
 */
export async function redirectIfAuthed(to = "/"): Promise<void> {
  const session = await auth();
  if (session?.user) redirect(to);
}
