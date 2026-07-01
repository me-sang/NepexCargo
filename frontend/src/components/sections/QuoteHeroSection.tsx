"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Unit = "kg" | "lb";

export function QuoteHeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Seed form state from URL so shareable links rehydrate.
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [weight, setWeight] = useState(searchParams.get("weight") ?? "");
  const [unit, setUnit] = useState<Unit>(
    (searchParams.get("unit") as Unit) || "kg",
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const weightNum = Number(weight);
    if (!from || !to) {
      setError("Please pick origin and destination countries.");
      return;
    }
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("Weight must be greater than 0.");
      return;
    }

    const params = new URLSearchParams({ from, to, weight, unit });
    router.replace(`?${params.toString()}`, { scroll: false });

    // Scroll to results once the section mounts.
    requestAnimationFrame(() => {
      document
        .getElementById("quote-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/aeroplane.png')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,36,43,0.55) 0%, rgba(9,36,43,0.35) 40%, rgba(9,36,43,0.55) 100%)",
        }}
      />

      <div className="relative z-10 container-content pt-16 lg:pt-24 pb-32 lg:pb-40">
        <div className="max-w-4xl text-white">
          <h1
            className="font-extrabold leading-[1.05] text-white tracking-[-0.025em] text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]"
            style={{ textShadow: "0 2px 32px rgba(9,36,43,0.45)" }}
          >
            Compare and book shipping in seconds.
          </h1>
          <p className="mt-5 text-[15px] lg:text-[16px] leading-relaxed text-white/85 max-w-[700px]">
            Discounted rates with premium couriers. Instant quotes — no registration
            needed. Compare prices and services from multiple couriers, all in one
            place.
          </p>
        </div>
      </div>

      <div className="relative z-10 container-content -mt-24 lg:-mt-28 pb-16 lg:pb-20">
        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-float)] bg-white"
        >
          <div className="bg-[var(--color-brand)] text-white text-center text-[14px] lg:text-[15px] font-semibold py-3.5 px-4">
            Get a instant quote without signing up
          </div>

          <div className="p-5 lg:p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_0.7fr_auto] gap-4 lg:gap-5 items-end">
              <Field label="Ship From">
                <CountrySelect
                  value={from}
                  onChange={setFrom}
                  placeholder="Origin Country"
                />
              </Field>

              <Field label="Ship To">
                <CountrySelect
                  value={to}
                  onChange={setTo}
                  placeholder="Destination Country"
                />
              </Field>

              <Field label="Parcel Weight">
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.00"
                  className="h-12 w-full rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] px-4 text-[14px] text-[var(--color-text)] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </Field>

              <Field label="Unit">
                <div className="relative">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="h-12 w-full appearance-none rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] pl-4 pr-9 text-[14px] font-semibold uppercase text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="kg">KG</option>
                    <option value="lb">LB</option>
                  </select>
                  <ChevronIcon />
                </div>
              </Field>

              <button
                type="submit"
                className="h-12 px-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors whitespace-nowrap"
              >
                Get Quote
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 text-[13px] text-white bg-[var(--color-alert)]/85 rounded-[var(--radius-md)] px-3 py-2"
              >
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function CountrySelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full appearance-none rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] pl-4 pr-9 text-[14px] focus:outline-none focus:border-[var(--color-accent)] ${
          value ? "text-[var(--color-text)]" : "text-[#9CA3AF]"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {/* ponytail: hardcoded shortlist of ISO-2 codes. Replace with /countries fetch when backend exposes it. */}
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="text-[var(--color-text)]">
            {c.name}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const COUNTRIES = [
  { code: "NP", name: "Nepal" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
];
