"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCenteredShell } from "./AuthCenteredShell";
import { EnvelopeIcon, LockQuestionIcon } from "@/components/ui/AuthIcons";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; resetToken?: string; error?: string }
        | null;
      if (!res.ok || !json?.ok || !json.resetToken) {
        throw new Error(json?.error ?? "Could not send code.");
      }
      sessionStorage.setItem("nepex.reset.email", email);
      sessionStorage.setItem("nepex.reset.token", json.resetToken);
      router.push("/forgot-password/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
      setSubmitting(false);
    }
  }

  return (
    <AuthCenteredShell
      icon={<LockQuestionIcon />}
      title="Forgot password?"
      description="No worries, we'll send you reset instructions."
      contentWidthClass="max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
            E-mail
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55">
              <EnvelopeIcon />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full h-12 pl-11 pr-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-body)]/45 text-[14px] focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[13px] text-[var(--color-alert)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white font-semibold text-[15px] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send 6-digit code"}
        </button>
      </form>
    </AuthCenteredShell>
  );
}
