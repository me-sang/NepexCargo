import type { BookingStatus } from "@/lib/bookings";

const TONE: Record<BookingStatus, { bg: string; fg: string; label: string }> = {
  draft: { bg: "#E5E7EB", fg: "#374151", label: "Draft" },
  confirmed: { bg: "#DBEAFE", fg: "#1D4ED8", label: "Confirmed" },
  in_transit: { bg: "#FEF3C7", fg: "#B45309", label: "In transit" },
  out_for_delivery: { bg: "#E0F2FE", fg: "#0369A1", label: "Out for delivery" },
  delivered: { bg: "#DCFCE7", fg: "#166534", label: "Delivered" },
  returned: { bg: "#FFE4E6", fg: "#9F1239", label: "Returned" },
  cancelled: { bg: "#FEE2E2", fg: "#B91C1C", label: "Cancelled" },
};

export function StatusPill({ status }: { status: BookingStatus }) {
  const t = TONE[status] ?? {
    bg: "#E5E7EB",
    fg: "#374151",
    label: status,
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {t.label}
    </span>
  );
}
