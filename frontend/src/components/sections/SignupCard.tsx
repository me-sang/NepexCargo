"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {
  EnvelopeIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  PersonIcon,
} from "@/components/ui/AuthIcons";

export function SignupCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
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

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Could not create your account.");
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) throw new Error("Account created — please sign in.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
      {/* Left — truck photo (desktop only) */}
      <div className="hidden lg:block relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface)] min-h-[640px]">
        <Image
          src="/images/container-truck.png"
          alt="Cargo truck on highway at sunset"
          fill
          priority
          sizes="(min-width: 1024px) 540px, 100vw"
          className="object-cover"
        />
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center px-1 sm:px-4 lg:px-8 py-2 lg:py-4">
        <h1 className="text-[2rem] lg:text-[2.25rem] font-extrabold text-[var(--color-text)] leading-none tracking-tight">
          Sign up
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-text-body)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55">
                <PersonIcon />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className={`${fieldClass} pl-11`}
              />
            </div>
          </div>

          {/* E-mail */}
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
                placeholder="example@gmail.com"
                className={`${fieldClass} pl-11`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55">
                <LockIcon />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••"
                className={`${fieldClass} pl-11 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center text-[var(--color-text-body)]/55 hover:text-[var(--color-text)] transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm" className="block text-[13px] font-semibold text-[var(--color-text)] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55">
                <LockIcon />
              </span>
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••"
                className={`${fieldClass} pl-11 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center text-[var(--color-text-body)]/55 hover:text-[var(--color-text)] transition-colors"
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
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
            className="mt-2 w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white font-semibold text-[15px] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        {/* OR divider */}
        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-[12px] font-medium tracking-[0.18em] text-[var(--color-text-body)]/55">OR</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <SocialButton label="Continue with Google" icon={<GoogleIcon />} onClick={() => signIn("google")} />
      </div>
    </div>
  );
}

const fieldClass =
  "w-full h-12 pr-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-body)]/45 text-[14px] focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-colors";

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-full bg-white border border-[var(--color-border)] hover:border-[var(--color-text-body)]/40 hover:bg-[var(--color-surface)] transition-colors inline-flex items-center justify-center gap-3 text-[14px] font-semibold text-[var(--color-text)]"
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
