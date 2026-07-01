import Link from "next/link";
import { auth } from "@/auth";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
  listBookings,
} from "@/lib/bookings";
import { countryName } from "@/lib/countries";
import { StatusPill } from "./StatusPill";

type SearchParams = Promise<{ page?: string; status?: string }>;

export default async function BookingsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = isBookingStatus(sp.status) ? sp.status : undefined;

  const session = await auth();
  const token = session?.accessToken;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-extrabold text-[var(--color-text)] leading-none tracking-tight">
            Bookings
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-body)]/70">
            All shipments you&apos;ve booked.
          </p>
        </div>
        <Link
          href="/check-international-shipping-rates"
          className="h-10 px-4 inline-flex items-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          New booking
        </Link>
      </header>

      <StatusFilter current={status} />

      {!token ? (
        <EmptyPanel title="Sign in to see your bookings." />
      ) : (
        <BookingsTable page={page} status={status} token={token} />
      )}
    </div>
  );
}

async function BookingsTable({
  page,
  status,
  token,
}: {
  page: number;
  status: BookingStatus | undefined;
  token: string;
}) {
  let items: Booking[] = [];
  let meta = { page, limit: 20, total: 0, totalPages: 1 };
  let loadError: string | null = null;

  try {
    const res = await listBookings({ page, limit: 20, status }, token);
    items = res.items;
    meta = res.meta;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load bookings.";
  }

  if (loadError) {
    return <EmptyPanel title="Couldn't load bookings." body={loadError} />;
  }
  if (items.length === 0) {
    return (
      <EmptyPanel
        title="No bookings yet."
        body="When you book a shipment, it'll show up here."
      />
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white overflow-hidden">
      <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr_0.9fr] gap-4 px-5 py-3 border-b border-[var(--color-border)] text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-text-body)]/65">
        <span>Airway bill</span>
        <span>Receiver</span>
        <span>Status</span>
        <span className="text-right">Total</span>
        <span className="text-right">Created</span>
      </div>
      <ul>
        {items.map((b) => (
          <li key={b.id}>
            <Link
              href={`/dashboard/bookings/${b.id}`}
              className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_0.9fr_0.9fr_0.9fr] gap-2 md:gap-4 px-5 py-4 border-b last:border-b-0 border-[var(--color-border)] hover:bg-[var(--color-surface)]/60 transition-colors items-center"
            >
              <span className="font-semibold text-[var(--color-text)] text-[14px] tabular-nums">
                {b.airwayBillNumber}
              </span>
              <span className="text-[13px] text-[var(--color-text-body)] truncate">
                {b.receiver?.name ?? "—"}{" "}
                <span className="text-[var(--color-text-body)]/55">
                  {b.receiver?.country
                    ? `· ${countryName(b.receiver.country)}`
                    : ""}
                </span>
              </span>
              <span>
                <StatusPill status={b.status} />
              </span>
              <span className="text-right text-[13px] font-semibold text-[var(--color-text)] tabular-nums">
                {formatMoney(b.total, b.currency)}
              </span>
              <span className="text-right text-[13px] text-[var(--color-text-body)]/75 tabular-nums">
                {formatDate(b.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination meta={meta} status={status} />
    </section>
  );
}

function StatusFilter({ current }: { current: BookingStatus | undefined }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5">
      <FilterChip href="/dashboard/bookings" active={!current} label="All" />
      {BOOKING_STATUSES.map((s) => (
        <FilterChip
          key={s}
          href={`/dashboard/bookings?status=${s}`}
          active={current === s}
          label={s.replace(/_/g, " ")}
        />
      ))}
    </nav>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center h-8 px-3 rounded-full text-[12px] font-semibold capitalize transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-white border border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-[var(--color-surface)]"
      }`}
    >
      {label}
    </Link>
  );
}

function Pagination({
  meta,
  status,
}: {
  meta: { page: number; totalPages: number; total: number };
  status: BookingStatus | undefined;
}) {
  if (meta.totalPages <= 1) return null;
  const prev = meta.page > 1 ? meta.page - 1 : null;
  const next = meta.page < meta.totalPages ? meta.page + 1 : null;
  const q = (p: number) => {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    if (status) sp.set("status", status);
    return `/dashboard/bookings?${sp.toString()}`;
  };
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] text-[13px] text-[var(--color-text-body)]">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        {prev ? (
          <Link
            href={q(prev)}
            className="h-8 px-3 inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white font-semibold hover:bg-[var(--color-surface)]"
          >
            Prev
          </Link>
        ) : (
          <span className="h-8 px-3 inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white opacity-40">
            Prev
          </span>
        )}
        {next ? (
          <Link
            href={q(next)}
            className="h-8 px-3 inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white font-semibold hover:bg-[var(--color-surface)]"
          >
            Next
          </Link>
        ) : (
          <span className="h-8 px-3 inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white opacity-40">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-10 text-center">
      <p className="text-[15px] font-semibold text-[var(--color-text)]">
        {title}
      </p>
      {body && (
        <p className="mt-1 text-[13px] text-[var(--color-text-body)]/70">
          {body}
        </p>
      )}
    </div>
  );
}

function isBookingStatus(v: unknown): v is BookingStatus {
  return typeof v === "string" && BOOKING_STATUSES.includes(v as BookingStatus);
}

function formatMoney(n: number | null | undefined, currency: string): string {
  if (n === null || n === undefined) return "—";
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
