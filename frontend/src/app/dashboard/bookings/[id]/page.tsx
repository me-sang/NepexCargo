import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { canCancelBooking, getBooking, type Booking } from "@/lib/bookings";
import { countryName } from "@/lib/countries";
import { CancelBookingButton } from "../CancelBookingButton";
import { StatusPill } from "../StatusPill";

type Params = Promise<{ id: string }>;

export default async function BookingDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-8 text-center">
        <p className="text-[15px] font-semibold text-[var(--color-text)]">
          Sign in to view this booking.
        </p>
      </div>
    );
  }

  let booking: Booking;
  try {
    booking = await getBooking(id, token);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-accent)] hover:underline"
      >
        ← All bookings
      </Link>

      <header className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-body)]/65">
              Airway bill
            </p>
            <h1
              className="mt-1 text-[1.5rem] font-extrabold text-[var(--color-text)] tabular-nums"
              style={{ letterSpacing: "-0.01em" }}
            >
              {booking.airwayBillNumber}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusPill status={booking.status} />
              <span className="text-[13px] text-[var(--color-text-body)]/75">
                Created {formatDateTime(booking.createdAt)}
              </span>
              {booking.updatedAt && (
                <span className="text-[13px] text-[var(--color-text-body)]/75">
                  · Updated {formatDateTime(booking.updatedAt)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-body)]/65">
              Total
            </p>
            <p
              className="mt-1 text-[1.5rem] font-extrabold text-[var(--color-text)] tabular-nums"
              style={{ letterSpacing: "-0.01em" }}
            >
              {formatMoney(booking.total, booking.currency)}
            </p>
          </div>
        </div>

        {canCancelBooking(booking.status) && (
          <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
            <CancelBookingButton id={booking.id} />
            <p className="mt-2 text-[12px] text-[var(--color-text-body)]/60">
              Cancellation is only available before the shipment enters transit.
            </p>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {booking.sender && <PartyCard title="Sender" party={booking.sender} />}
        {booking.receiver && (
          <PartyCard title="Receiver" party={booking.receiver} />
        )}
      </div>

      {booking.shipmentDetails && booking.shipmentDetails.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-[1.0625rem] font-extrabold text-[var(--color-text)]">
            Shipment ({booking.shipmentDetails.length}{" "}
            {booking.shipmentDetails.length === 1 ? "parcel" : "parcels"})
          </h2>
          <ul className="mt-4 space-y-3">
            {booking.shipmentDetails.map((item, i) => (
              <li
                key={i}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="text-[14px] font-semibold text-[var(--color-text)]">
                    Parcel {i + 1}
                  </p>
                  <p className="text-[13px] text-[var(--color-text-body)]">
                    {item.weight} {item.weightUnit} · {item.dimensions.length}×
                    {item.dimensions.width}×{item.dimensions.height}{" "}
                    {item.dimensions.dimensionUnit} · Value{" "}
                    {formatMoney(item.approxItemValue, booking.currency)}
                  </p>
                </div>
                {item.remarks && (
                  <p className="mt-2 text-[13px] text-[var(--color-text-body)]/85">
                    {item.remarks}
                  </p>
                )}
                {item.additionalService && (
                  <p className="mt-1 text-[12px] text-[var(--color-text-body)]/70">
                    Add-on: {item.additionalService.replace(/_/g, " ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
        <h2 className="text-[1.0625rem] font-extrabold text-[var(--color-text)]">
          Charges
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <ChargeRow label="Shipping cost" value={booking.shippingCost} currency={booking.currency} />
          <ChargeRow
            label="Protection cover"
            value={booking.protectionCost}
            currency={booking.currency}
          />
          <ChargeRow label="Tax" value={booking.tax} currency={booking.currency} />
          <div className="col-span-2 mt-2 pt-3 border-t border-[var(--color-border)] flex items-baseline justify-between">
            <span className="text-[15px] font-extrabold text-[var(--color-text)]">
              Total
            </span>
            <span className="text-[16px] font-extrabold text-[var(--color-accent)] tabular-nums">
              {formatMoney(booking.total, booking.currency)}
            </span>
          </div>
        </dl>
        <p className="mt-4 text-[12px] text-[var(--color-text-body)]/70">
          Protection:{" "}
          <span className="capitalize font-semibold text-[var(--color-text)]">
            {booking.protectionType?.replace(/_/g, " ") ?? "—"}
          </span>
          {booking.protectionValue != null && (
            <> · Declared value {formatMoney(booking.protectionValue, booking.currency)}</>
          )}
        </p>
      </section>

      {booking.notes && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-[1.0625rem] font-extrabold text-[var(--color-text)]">
            Notes
          </h2>
          <p className="mt-2 text-[13px] text-[var(--color-text-body)] whitespace-pre-wrap">
            {booking.notes}
          </p>
        </section>
      )}
    </div>
  );
}

function PartyCard({
  title,
  party,
}: {
  title: string;
  party: NonNullable<Booking["sender"]>;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-body)]/65">
        {title}
      </p>
      <p className="mt-2 text-[15px] font-extrabold text-[var(--color-text)]">
        {party.name}
      </p>
      <p className="mt-0.5 text-[13px] text-[var(--color-text-body)]">
        {party.email} · {party.phone}
      </p>
      <address className="mt-3 not-italic text-[13px] leading-relaxed text-[var(--color-text-body)]">
        {party.addressLine1}
        {party.addressLine2 && (
          <>
            <br />
            {party.addressLine2}
          </>
        )}
        <br />
        {[party.city, party.state, party.zip].filter(Boolean).join(", ")}
        <br />
        {countryName(party.country)}
      </address>
    </section>
  );
}

function ChargeRow({
  label,
  value,
  currency,
}: {
  label: string;
  value: number | null | undefined;
  currency: string;
}) {
  return (
    <>
      <dt className="text-[var(--color-text-body)]">{label}</dt>
      <dd className="text-right font-semibold text-[var(--color-text)] tabular-nums">
        {formatMoney(value, currency)}
      </dd>
    </>
  );
}

function formatMoney(
  n: number | null | undefined,
  currency: string,
): string {
  if (n === null || n === undefined) return "—";
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
