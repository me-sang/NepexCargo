"use client";

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { AuthCenteredShell } from "./AuthCenteredShell";
import { EnvelopeSolidIcon } from "@/components/ui/AuthIcons";
import { useSessionItem } from "@/lib/use-session-item";

const LENGTH = 4;

export function OtpForm() {
  const router = useRouter();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const email = useSessionItem("nepex.reset.email");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function setDigitAt(i: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, "").slice(-1);
    setDigitAt(i, v);
    if (v && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  async function handleResend() {
    if (resending || !email) return;
    setResending(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      setError("Could not resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== LENGTH) {
      setError("Please enter all 4 digits.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error("Failed");
      sessionStorage.setItem("nepex.reset.code", code);
      router.push("/forgot-password/reset");
    } catch {
      setError("Invalid or expired code.");
      setSubmitting(false);
    }
  }

  return (
    <AuthCenteredShell
      icon={<EnvelopeSolidIcon />}
      title="Enter your code"
      description={
        <>
          We sent a code to{" "}
          <span className="font-semibold text-[var(--color-text)]">
            {email || "your email"}
          </span>
        </>
      }
      contentWidthClass="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="flex items-center justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`h-14 w-14 text-center text-[1.5rem] font-bold rounded-[var(--radius-md)] bg-white border text-[var(--color-text)] focus:outline-none transition-colors ${
                d ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
              } focus:border-[var(--color-accent)]`}
            />
          ))}
        </div>

        <p className="text-center text-[13px] text-[var(--color-text-body)]/70">
          Didn&apos;t receive the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)] disabled:opacity-60"
          >
            Click to resend
          </button>
        </p>

        {error && (
          <p role="alert" className="text-center text-[13px] text-[var(--color-alert)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white font-semibold text-[15px] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
        >
          {submitting ? "Verifying…" : "Continue"}
        </button>
      </form>
    </AuthCenteredShell>
  );
}
