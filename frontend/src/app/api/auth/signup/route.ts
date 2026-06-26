import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; password?: string }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const user = await authService.signup({
      name: body.name ?? "",
      email: body.email,
      password: body.password,
    });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed" },
      { status: 400 },
    );
  }
}
