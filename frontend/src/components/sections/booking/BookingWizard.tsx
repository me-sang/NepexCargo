"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShipmentStep,
  PartyStep,
  ProtectionStep,
  ConfirmStep,
} from "./BookingSteps";
import type { BookingState } from "./BookingSteps";
import { initialBookingState } from "./BookingSteps";
import {
  createBooking,
  validateBookingState,
  type Booking,
} from "@/lib/bookings";

const STEPS = [
  { slug: "shipment", label: "Shipment Details" },
  { slug: "sender", label: "Sender Details" },
  { slug: "receiver", label: "Receiver Details" },
  { slug: "protection", label: "Protection Cover Details" },
  { slug: "confirm", label: "Confirm Shipment" },
] as const;

type StepSlug = (typeof STEPS)[number]["slug"];

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawStep = params.get("step") as StepSlug | null;
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.slug === rawStep),
  );
  const current = STEPS[currentIndex === -1 ? 0 : currentIndex];
  const idx = currentIndex === -1 ? 0 : currentIndex;

  const [state, setState] = useState<BookingState>(initialBookingState);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function goTo(nextIdx: number) {
    const clamped = Math.min(STEPS.length - 1, Math.max(0, nextIdx));
    const p = new URLSearchParams(params.toString());
    p.set("step", STEPS[clamped].slug);
    router.replace(`?${p.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFinalSubmit() {
    setSubmitError(null);
    const validationError = validateBookingState(state);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    const token = session?.accessToken;
    if (!token) {
      const callback = encodeURIComponent(
        `${pathname}?${params.toString()}`,
      );
      router.push(`/login?callbackUrl=${callback}`);
      return;
    }
    setSubmitting(true);
    try {
      const rateCardId = params.get("rateCardId") ?? undefined;
      const created = await createBooking(state, token, rateCardId);
      setBooking(created);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Booking failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLast) {
      void handleFinalSubmit();
      return;
    }
    goTo(idx + 1);
  }

  const isFirst = idx === 0;
  const isLast = idx === STEPS.length - 1;
  const sidebar = getSidebar(current.slug);

  if (booking) return <SuccessScreen booking={booking} />;

  return (
    <div className="container-content py-8 lg:py-12">
      <Stepper current={idx} onSelect={goTo} />

      <div
        className={`mt-6 grid grid-cols-1 gap-6 ${
          sidebar ? "lg:grid-cols-[1fr_320px]" : ""
        }`}
      >
        <form
          onSubmit={handleNext}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6 lg:p-8"
        >
          {current.slug === "shipment" && (
            <ShipmentStep state={state} setState={setState} />
          )}
          {current.slug === "sender" && (
            <PartyStep
              partyKey="sender"
              title="Sender Details"
              addressLabel="Return Address"
              state={state}
              setState={setState}
            />
          )}
          {current.slug === "receiver" && (
            <PartyStep
              partyKey="receiver"
              title="Receiver Details"
              addressLabel="Delivery Address"
              state={state}
              setState={setState}
              withResidentialCheckbox
            />
          )}
          {current.slug === "protection" && (
            <ProtectionStep state={state} setState={setState} />
          )}
          {current.slug === "confirm" && (
            <ConfirmStep state={state} setState={setState} />
          )}

          {isLast && submitError && (
            <p
              role="alert"
              className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-alert)]/40 bg-[var(--color-alert)]/10 px-4 py-3 text-[13px] text-[var(--color-alert)]"
            >
              {submitError}
            </p>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            {!isFirst && (
              <button
                type="button"
                onClick={() => goTo(idx - 1)}
                disabled={submitting}
                className="h-11 px-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-[14px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-[var(--radius-md)] bg-[#22C55E] text-white text-[14px] font-semibold hover:bg-[#16A34A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLast
                ? submitting
                  ? "Confirming…"
                  : "Confirm and add to cart"
                : "Next"}
            </button>
          </div>
        </form>

        {sidebar}
      </div>
    </div>
  );
}

function getSidebar(slug: StepSlug) {
  switch (slug) {
    case "shipment":
      return <WhyChooseSidebar />;
    case "protection":
      return <ImportNotesSidebar />;
    case "confirm":
      return <ShipmentInfoSidebar />;
    default:
      return null;
  }
}

function Stepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white px-5 py-4 lg:px-8 lg:py-5 flex flex-wrap lg:flex-nowrap items-center gap-y-3">
      {STEPS.map((step, i) => {
        const isComplete = i <= current;
        const isLast = i === STEPS.length - 1;
        const isActive = i === current;
        return (
          <li
            key={step.slug}
            className="flex items-center min-w-[180px] lg:min-w-0 lg:flex-1 lg:last:flex-none"
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isActive ? "step" : undefined}
              className={`flex items-center gap-2.5 shrink-0 lg:min-w-[210px] rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 ${
                isActive ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold shrink-0 ${
                  isComplete
                    ? "bg-[#22C55E] text-white"
                    : "bg-white text-[var(--color-text-body)]/50 border border-[var(--color-border)]"
                }`}
              >
                {isComplete ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`text-[13px] font-semibold whitespace-nowrap ${
                  isComplete
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-body)]/55"
                }`}
              >
                {step.label}
              </span>
            </button>
            {!isLast && (
              <span
                aria-hidden="true"
                className="hidden lg:block flex-1 h-px bg-[var(--color-border)] mx-4"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function WhyChooseSidebar() {
  const items = [
    {
      title: "Fast Delivery",
      body: "Instant Local Delivery Services within 2 hours Max.",
      icon: <RocketIcon />,
    },
    {
      title: "Reliability",
      body: "We deliver on time with precision, care, and consistency.",
      icon: <BustIcon />,
    },
    {
      title: "Transparency",
      body: "Track every shipment in real-time. Stay informed from start to finish.",
      icon: <EyeIcon />,
    },
  ];

  return (
    <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 lg:p-6 h-fit">
      <h2 className="text-[1.125rem] font-extrabold text-[var(--color-text)]">
        Why choose Nepex Cargo?
      </h2>
      <ul className="mt-4 space-y-4">
        {items.map((it) => (
          <li
            key={it.title}
            className="rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] p-5"
          >
            <span
              aria-hidden="true"
              className="inline-flex text-[var(--color-accent)]"
            >
              {it.icon}
            </span>
            <h3 className="mt-4 text-[15px] font-extrabold text-[var(--color-text)]">
              {it.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-body)]/85">
              {it.body}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function RocketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
      />
      <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
    </svg>
  );
}

function BustIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M12 12c-4.4 0-8 3.6-8 8 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-4.4-3.6-8-8-8z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5C6.5 5 2.5 9.5 1 12c1.5 2.5 5.5 7 11 7s9.5-4.5 11-7c-1.5-2.5-5.5-7-11-7z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="4" fill="white" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function ImportNotesSidebar() {
  return (
    <aside className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] h-fit">
      <div className="bg-[var(--color-accent)] text-white text-[14px] font-semibold px-5 py-3 flex items-center gap-2">
        <InfoDotIcon />
        Import Notes
      </div>
      <div className="bg-[var(--color-accent-soft)] p-5 space-y-3 text-[13px] leading-relaxed">
        <p className="text-[var(--color-text)]">
          <strong className="font-bold">Please note:</strong> protection cover
          will not be valid when applied to any shipment containing items on
          the{" "}
          <a
            href="#"
            className="text-[var(--color-accent)] font-semibold underline underline-offset-2"
          >
            prohibited and restricted items list
          </a>
        </p>
        <p className="italic text-[var(--color-text-body)]">
          Please check carefully to ensure you are allowed to ship your item
          and whether it is carried on a no compensation basis.
        </p>
      </div>
    </aside>
  );
}

function ShipmentInfoSidebar() {
  return (
    <aside className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] h-fit">
      <div className="bg-[var(--color-accent)] text-white text-[14px] font-semibold px-5 py-3 flex items-center gap-2">
        <InfoDotIcon />
        Shipment Information
      </div>
      <div className="bg-[var(--color-accent-soft)] p-5 space-y-4">
        <div className="flex items-center gap-3">
          {/* ponytail: hardcoded courier tile; swap when selected rate is threaded through. */}
          <div className="h-12 w-12 rounded-md bg-[#241E13] flex items-center justify-center text-[10px] font-extrabold text-[#FFC72C]">
            UPS
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-extrabold text-[var(--color-text)]">
              USPS Ground Advantage
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-body)] inline-flex items-center gap-1">
              <ClockIcon />
              2 to 8 business days delivery
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)]/70" />

        <ul className="space-y-3 text-[13px]">
          <li className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[var(--color-text)] min-w-0">
              <ShieldSmallIcon />
              <span>
                Protected value:{" "}
                <strong className="font-semibold">NPR. 100</strong>
              </span>
            </span>
            <a
              href="#"
              className="text-[var(--color-accent)] font-semibold hover:underline shrink-0"
            >
              Change
            </a>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[var(--color-text)]">
              <DocSmallIcon />
              Parcel information
            </span>
            <a
              href="#"
              className="text-[var(--color-accent)] font-semibold hover:underline shrink-0"
            >
              View
            </a>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[var(--color-text)]">
              <AlertSmallIcon />
              Prohibited items
            </span>
            <a
              href="#"
              className="text-[var(--color-accent)] font-semibold hover:underline shrink-0"
            >
              View
            </a>
          </li>
        </ul>

        <div className="rounded-[var(--radius-md)] bg-white/60 p-4">
          <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--color-text-body)]/80">
            PRICE BREAKDOWN
          </p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <PriceRow label="Shipping cost" value="NPR. 1,500" />
            <PriceRow label="Protection cover cost" value="NPR. 0.00" />
            <PriceRow label="Subtotal" value="NPR. 1,500" />
            <PriceRow label="Tax" value="NPR. 0.00" />
          </dl>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]/70 flex justify-between items-baseline">
            <span className="text-[15px] font-extrabold text-[var(--color-text)]">
              Total
            </span>
            <span className="text-[17px] font-extrabold text-[var(--color-accent)]">
              NPR. 1,500
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-[var(--color-text-body)]">{label}</dt>
      <dd className="text-[var(--color-text)] font-semibold">{value}</dd>
    </div>
  );
}

function InfoDotIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[var(--color-accent)] text-[11px] font-bold"
    >
      i
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ShieldSmallIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--color-text-body)]"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function DocSmallIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--color-text-body)]"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function AlertSmallIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--color-text-body)]"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  );
}

function SuccessScreen({ booking }: { booking: Booking }) {
  return (
    <div className="container-content py-16 lg:py-24">
      <div className="mx-auto max-w-[560px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 lg:p-10 text-center">
        <span
          aria-hidden="true"
          className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] text-white"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        <h2 className="mt-5 text-[1.5rem] font-extrabold text-[var(--color-text)]">
          Shipment booked
        </h2>
        <p className="mt-2 text-[14px] text-[var(--color-text-body)]">
          Your booking is confirmed. Track it under your dashboard.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-left text-[13px] rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4">
          <dt className="text-[var(--color-text-body)]/75">Airway bill</dt>
          <dd className="font-semibold text-[var(--color-text)] text-right">
            {booking.airwayBillNumber}
          </dd>
          <dt className="text-[var(--color-text-body)]/75">Status</dt>
          <dd className="font-semibold text-[var(--color-text)] text-right capitalize">
            {booking.status.replace(/_/g, " ")}
          </dd>
        </dl>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="h-11 inline-flex items-center px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
