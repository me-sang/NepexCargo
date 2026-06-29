"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthCenteredShell } from "./AuthCenteredShell";
import { EyeIcon, EyeOffIcon, LockIcon, LockQuestionIcon } from "@/components/ui/AuthIcons";
import { useSessionItem } from "@/lib/use-session-item";

export function SetNewPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetToken = useSessionItem("nepex.reset.token");
  const otp = useSessionItem("nepex.reset.otp");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!resetToken || !otp) {
      setError("Your reset session has expired. Start again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, otp, newPassword: password }),
      });
      if (!res.ok) throw new Error("Failed");
      sessionStorage.removeItem("nepex.reset.email");
      sessionStorage.removeItem("nepex.reset.token");
      sessionStorage.removeItem("nepex.reset.otp");
      router.push("/forgot-password/success");
    } catch {
      setError("Could not reset password. The code may be invalid or expired.");
      setSubmitting(false);
    }
  }

  return (
    <AuthCenteredShell
      icon={<LockQuestionIcon />}
      title="Set new password"
      description="Must be at least 8 characters."
      contentWidthClass="max-w-[480px]"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <PasswordField
          id="password"
          label="Password"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
        />

        {error && (
          <p role="alert" className="text-[13px] text-[var(--color-alert)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white font-semibold text-[15px] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Set new password"}
        </button>
      </form>
    </AuthCenteredShell>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55">
          <LockIcon />
        </span>
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          required
          minLength={8}
          placeholder="••••••••"
          className="w-full h-12 pl-11 pr-12 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-body)]/45 text-[14px] focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center text-[var(--color-text-body)]/55 hover:text-[var(--color-text)] transition-colors"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
