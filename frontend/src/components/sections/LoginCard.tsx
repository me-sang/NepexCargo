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
} from "@/components/ui/AuthIcons";

export function LoginCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setSubmitting(false);
      setError("Invalid email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
      {/* Left — truck photo (desktop only) */}
      <div className="hidden lg:block relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface)] min-h-[560px]">
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
          Sign in
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-text-body)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
          >
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email */}
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

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-body)] cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded-[3px] border border-[var(--color-border)] accent-[var(--color-accent)]"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
            >
              Forgot Password?
            </Link>
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
            {submitting ? "Signing in…" : "Sign in"}
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
