import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  if (!body?.email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  try {
    const { resetToken } = await authService.sendResetCode(body.email);
    return NextResponse.json({ ok: true, resetToken });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send code" },
      { status: 400 },
    );
  }
}
