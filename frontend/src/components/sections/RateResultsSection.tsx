"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ponytail: single hardcoded courier logo + fixed delivery ETA for every row.
// Swap both when backend returns per-rate carrier + transit-time.
const COURIER_LOGO = "/images/emx-logo.jpg";
const DELIVERY_ETA = "1 - 2 Business days";

type Rate = {
  rateCardId: string;
  name: string | null;
  currency: string;
  weightUnit: string;
  chargeableWeight: number;
  destinationZone: { id: string; name: string };
  tier: {
    minWeight: number;
    maxWeight: number | null;
    price: number;
    flatPrice: number | null;
    total: number;
  } | null;
};

type CheckRatesData = {
  sourceCountry: string;
  destinationCountry: string;
  destinationZone: { id: string; name: string } | null;
  inputWeight: number;
  inputWeightUnit: string;
  rates: Rate[];
};

type CheckRatesResponse = {
  success: boolean;
  message?: string;
  data?: CheckRatesData;
  errors?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function RateResultsSection() {
  const params = useSearchParams();
  const from = params.get("from");
  const to = params.get("to");
  const weight = params.get("weight");
  const unit = params.get("unit");

  const [data, setData] = useState<CheckRatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to || !weight || !unit) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${API_URL}/shipment/international/check-rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLocation: from,
        destinationLocation: to,
        locationType: "country",
        minWeight: Number(weight),
        weightUnit: unit,
      }),
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as CheckRatesResponse | null;
        if (!res.ok || !json?.success || !json.data) {
          const fieldErrors = json?.errors?.fieldErrors;
          const first = fieldErrors
            ? Object.values(fieldErrors).flat()[0]
            : undefined;
          throw new Error(
            first ?? json?.message ?? "Could not fetch rates right now.",
          );
        }
        if (!cancelled) setData(json.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not fetch rates.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, weight, unit]);

  if (!from || !to || !weight || !unit) return null;

  return (
    <section id="quote-results" className="bg-[var(--color-surface)] pt-12 lg:pt-16 pb-16 lg:pb-20">
      <div className="container-content max-w-[1080px]">
        {loading && <SkeletonState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && data && <Results data={data} />}
      </div>
    </section>
  );
}

function Results({ data }: { data: CheckRatesData }) {
  if (!data.destinationZone) {
    return (
      <Panel>
        <h2 className="text-[1.25rem] font-extrabold text-[var(--color-text)]">
          We don&apos;t ship to{" "}
          <span className="text-[var(--color-accent)]">
            {data.destinationCountry}
          </span>{" "}
          from{" "}
          <span className="text-[var(--color-accent)]">
            {data.sourceCountry}
          </span>{" "}
          yet.
        </h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-body)]">
          The destination isn&apos;t in any of our configured zones. Try a
          different lane or{" "}
          <Link
            href="/contact"
            className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
          >
            ask us about it
          </Link>
          .
        </p>
      </Panel>
    );
  }

  if (data.rates.length === 0) {
    return (
      <Panel>
        <h2 className="text-[1.25rem] font-extrabold text-[var(--color-text)]">
          No rate cards on this lane.
        </h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-body)]">
          {data.sourceCountry} → {data.destinationZone.name} has no active
          rate cards for {data.inputWeight} {data.inputWeightUnit} right now.{" "}
          <Link
            href="/contact"
            className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
          >
            Talk to us
          </Link>{" "}
          for a custom quote.
        </p>
      </Panel>
    );
  }

  return (
    <>
      <RouteHeader data={data} />

      <ol className="mt-5 space-y-3">
        {data.rates.map((rate) => (
          <li key={rate.rateCardId}>
            <RateRow rate={rate} />
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[13px] text-[var(--color-text-body)]/75">
        Need something we don&apos;t list?{" "}
        <Link
          href="/contact"
          className="font-semibold text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
        >
          Talk to us
        </Link>
        .
      </p>
    </>
  );
}

function RouteHeader({ data }: { data: CheckRatesData }) {
  return (
    <header className="pb-2">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/65">
        Rates for
      </p>
      <h2 className="mt-1 text-[1.5rem] lg:text-[1.75rem] font-extrabold text-[var(--color-text)] leading-tight">
        <span>{data.sourceCountry}</span>
        <span className="mx-2 text-[var(--color-accent)]">→</span>
        <span>{data.destinationZone?.name}</span>
      </h2>
      <p className="mt-1 text-[13px] text-[var(--color-text-body)]/80">
        {data.inputWeight} {data.inputWeightUnit} · {data.rates.length} rate
        {data.rates.length === 1 ? "" : "s"}
      </p>
    </header>
  );
}

function RateRow({ rate }: { rate: Rate }) {
  const outOfRange = rate.tier === null;

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-4 py-4 lg:px-6 lg:py-5">
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* Logo */}
        <div className="relative shrink-0 h-14 w-14 lg:h-16 lg:w-16 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Image
            src={COURIER_LOGO}
            alt="EMX"
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </div>

        {/* Name */}
        <div className="min-w-[140px]">
          <h3 className="text-[1rem] lg:text-[1.0625rem] font-extrabold text-[var(--color-text)] leading-tight">
            EMX {rate.name ?? "Rate"}
          </h3>
          <p className="mt-1 text-[12px] text-[var(--color-text-body)]/75">
            {rate.chargeableWeight.toFixed(2)} {rate.weightUnit} chargeable
          </p>
        </div>

        {/* Delivery ETA */}
        <div className="min-w-[150px]">
          <p className="text-[14px] font-semibold text-[var(--color-text)]">
            {DELIVERY_ETA}
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-body)]/70">
            Estimated delivery
          </p>
        </div>

        {/* Price + CTA (pushed right) */}
        <div className="ml-auto flex items-center gap-4 lg:gap-6">
          <div className="text-right">
            {outOfRange ? (
              <>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-alert)]">
                  Out of range
                </p>
                <p className="mt-1 text-[12px] text-[var(--color-text-body)]/75 max-w-[200px]">
                  Weight exceeds this rate&apos;s bracket.
                </p>
              </>
            ) : (
              <p
                className="text-[1.125rem] lg:text-[1.25rem] font-extrabold text-[var(--color-text)] leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {rate.currency} {formatMoney(rate.tier!.total)}
              </p>
            )}
          </div>

          {outOfRange ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 h-10 lg:h-11 px-4 lg:px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] lg:text-[14px] font-semibold opacity-40 cursor-not-allowed whitespace-nowrap"
            >
              Book Now
              <BookNowArrow />
            </button>
          ) : (
            <Link
              href={`/book-international-shipment?step=shipment&rateCardId=${rate.rateCardId}`}
              className="inline-flex items-center gap-2 h-10 lg:h-11 px-4 lg:px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] lg:text-[14px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors whitespace-nowrap"
            >
              Book Now
              <BookNowArrow />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function BookNowArrow() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 lg:p-8 shadow-[var(--shadow-card)]">
      {children}
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-1/2 rounded bg-white animate-pulse" />
      <div className="h-20 rounded-[var(--radius-lg)] bg-white animate-pulse" />
      <div className="h-20 rounded-[var(--radius-lg)] bg-white animate-pulse" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Panel>
      <h2 className="text-[1.25rem] font-extrabold text-[var(--color-text)]">
        Couldn&apos;t fetch rates.
      </h2>
      <p className="mt-2 text-[14px] text-[var(--color-text-body)]">{message}</p>
      <p className="mt-3 text-[13px] text-[var(--color-text-body)]/70">
        Adjust the form above and try again.
      </p>
    </Panel>
  );
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
