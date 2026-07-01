"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cancelBooking } from "@/lib/bookings";

export async function cancelBookingAction(id: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.accessToken) {
    return { ok: false, error: "You must be signed in to cancel." };
  }
  try {
    await cancelBooking(id, session.accessToken);
    revalidatePath(`/dashboard/bookings/${id}`);
    revalidatePath("/dashboard/bookings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Cancel failed.",
    };
  }
}
