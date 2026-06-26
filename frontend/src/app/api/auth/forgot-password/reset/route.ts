import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; code?: string; password?: string }
    | null;

  if (!body?.email || !body?.code || !body?.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await authService.resetPassword({
      email: body.email,
      code: body.code,
      password: body.password,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reset failed" },
      { status: 400 },
    );
  }
}
