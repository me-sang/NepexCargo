import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  if (!body?.email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  await authService.sendResetCode(body.email);
  return NextResponse.json({ ok: true });
}
