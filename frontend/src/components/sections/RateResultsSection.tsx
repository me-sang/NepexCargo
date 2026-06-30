"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ponytail: single hardcoded courier logo for every rate row.
// Swap when backend returns per-rate carrier branding.
const COURIER_LOGO = "/images/emx-logo.jpg";

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
    <section id="quote-results" className="bg-white pt-12 lg:pt-16 pb-16 lg:pb-20">
      <div className="container-content max-w-[920px]">
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

  // Shared horizontal scale across all band-graphs, so cards compare on the same axis.
  const scaleMax = computeScaleMax(data.rates, data.inputWeight);
  const priced = data.rates.filter((r) => r.tier !== null);
  const cheapest = priced.reduce<Rate | null>(
    (best, r) =>
      r.tier && (!best?.tier || r.tier.total < best.tier.total) ? r : best,
    null,
  );

  return (
    <>
      <RouteHeader data={data} cheapest={cheapest} />

      <ol className="mt-5 space-y-3">
        {data.rates.map((rate) => (
          <li key={rate.rateCardId}>
            <RateCard rate={rate} scaleMax={scaleMax} />
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

function RouteHeader({
  data,
  cheapest,
}: {
  data: CheckRatesData;
  cheapest: Rate | null;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/65">
          Rates for
        </p>
        <h2 className="mt-1 text-[1.5rem] lg:text-[1.75rem] font-extrabold text-[var(--color-text)] leading-tight">
          <span>{data.sourceCountry}</span>
          <span className="mx-2 text-[var(--color-accent)]">→</span>
          <span>{data.destinationZone?.name}</span>
        </h2>
        <p className="mt-1 text-[13px] text-[var(--color-text-body)]/80">
          {data.inputWeight} {data.inputWeightUnit} ·{" "}
          {data.rates.length} rate{data.rates.length === 1 ? "" : "s"}
        </p>
      </div>

      {cheapest?.tier && (
        <div className="text-right">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/65">
            Cheapest
          </p>
          <p
            className="mt-1 text-[1.5rem] font-extrabold text-[var(--color-text)] leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {cheapest.currency}{" "}
            {formatMoney(cheapest.tier.total)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-body)]/75">
            via {cheapest.name ?? "Unnamed rate"}
          </p>
        </div>
      )}
    </header>
  );
}

function RateCard({ rate, scaleMax }: { rate: Rate; scaleMax: number }) {
  const outOfRange = rate.tier === null;

  return (
    <article
      className={`rounded-[var(--radius-lg)] border bg-white px-5 py-5 lg:px-6 lg:py-6 transition-shadow border-[var(--color-border)] ${
        outOfRange ? "" : "hover:shadow-[var(--shadow-card-lg)]"
      }`}
    >
      <div className="flex items-start gap-4 lg:gap-5">
        {/* Courier logo tile */}
        <div className="relative shrink-0 h-14 w-14 lg:h-16 lg:w-16 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Image
            src={COURIER_LOGO}
            alt="EMX"
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </div>

        <div className="min-w-0 flex-1 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[1.375rem] lg:text-[1.5rem] font-extrabold text-[var(--color-accent)] leading-none tracking-[-0.02em]">
              {rate.name ?? "Unnamed rate"}
            </h3>
            <p className="mt-2 text-[13px] text-[var(--color-text-body)]/80">
              {rate.chargeableWeight.toFixed(2)} {rate.weightUnit} chargeable
              {rate.tier && (
                <>
                  {" "}· bracket{" "}
                  <span className="text-[var(--color-text)] font-semibold">
                    {formatRange(rate.tier.minWeight, rate.tier.maxWeight)}{" "}
                    {rate.weightUnit}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="text-right shrink-0">
            {outOfRange ? (
              <>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/65">
                  Out of range
                </p>
                <p
                  className="mt-1 text-[14px] text-[var(--color-text)] max-w-[260px] ml-auto"
                  role="status"
                >
                  Heaviest band on this card ends below your weight.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/65">
                  {rate.currency}
                </p>
                <p
                  className="mt-1 text-[1.625rem] lg:text-[1.875rem] font-extrabold text-[var(--color-text)] leading-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatMoney(rate.tier!.total)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <BandGraph rate={rate} scaleMax={scaleMax} />
    </article>
  );
}

function BandGraph({ rate, scaleMax }: { rate: Rate; scaleMax: number }) {
  const dotPct = Math.min((rate.chargeableWeight / scaleMax) * 100, 100);

  const bandLeftPct = rate.tier
    ? (rate.tier.minWeight / scaleMax) * 100
    : null;
  const bandWidthPct = rate.tier
    ? (((rate.tier.maxWeight ?? scaleMax) - rate.tier.minWeight) / scaleMax) *
      100
    : null;

  return (
    <div className="mt-5">
      <div className="relative h-4 w-full" role="img" aria-label="Weight band">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[var(--color-border)] rounded-full" />
        {/* Active band */}
        {bandLeftPct !== null && bandWidthPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-[var(--color-accent)] rounded-full"
            style={{ left: `${bandLeftPct}%`, width: `${bandWidthPct}%` }}
          />
        )}
        {/* Chargeable-weight dot */}
        <span
          aria-hidden="true"
          className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 ${
            rate.tier
              ? "bg-[var(--color-ink)] border-white"
              : "bg-[var(--color-alert)] border-white"
          }`}
          style={{ left: `calc(${dotPct}% - 6px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-[var(--color-text-body)]/55">
        <span>0 {rate.weightUnit}</span>
        <span>
          {formatNumber(scaleMax)} {rate.weightUnit}
        </span>
      </div>
    </div>
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
      <div className="h-8 w-1/2 rounded bg-[var(--color-surface)] animate-pulse" />
      <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-surface)] animate-pulse" />
      <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-surface)] animate-pulse" />
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

function computeScaleMax(rates: Rate[], inputWeight: number): number {
  const candidates: number[] = [inputWeight];
  for (const r of rates) {
    candidates.push(r.chargeableWeight);
    if (r.tier) {
      candidates.push(r.tier.minWeight);
      if (r.tier.maxWeight !== null) candidates.push(r.tier.maxWeight);
    }
  }
  const max = Math.max(...candidates, 1);
  return max * 1.15;
}

function formatRange(min: number, max: number | null): string {
  const minStr = formatNumber(min);
  if (max === null) return `${minStr}+`;
  return `${minStr}–${formatNumber(max)}`;
}

function formatNumber(n: number): string {
  return n % 1 === 0 ? n.toString() : n.toFixed(2).replace(/\.?0+$/, "");
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
