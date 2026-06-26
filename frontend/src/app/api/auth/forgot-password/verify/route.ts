import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; code?: string }
    | null;

  if (!body?.email || !body?.code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await authService.verifyResetCode({ email: body.email, code: body.code });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid code" },
      { status: 400 },
    );
  }
}
