import { NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { resetToken?: string; otp?: string; newPassword?: string }
    | null;

  if (!body?.resetToken || !body?.otp || !body?.newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await authService.resetPassword({
      resetToken: body.resetToken,
      otp: body.otp,
      newPassword: body.newPassword,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reset failed" },
      { status: 400 },
    );
  }
}
