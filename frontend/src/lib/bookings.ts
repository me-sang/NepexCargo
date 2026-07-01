import type {
  BookingState,
  Party,
  Parcel,
  Receiver,
} from "@/components/sections/booking/BookingSteps";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Backend contract (mirrors backend/src/common/dto/booking.dto.ts) ──────────

type ContactAddress = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string; // ISO2
};

type ShipmentItem = {
  weight: number;
  weightUnit: "kg" | "lb";
  dimensions: {
    length: number;
    width: number;
    height: number;
    dimensionUnit: "cm" | "in";
  };
  additionalService?: string;
  remarks?: string;
  approxItemValue: number;
};

export type CreateBookingBody = {
  sender: ContactAddress;
  receiver: ContactAddress;
  shipmentDetails: ShipmentItem[];
  protectionType: "free" | "opt_out" | "insured";
  protectionValue?: number;
  currency?: string;
  notes?: string;
  rateCardId?: string;
};

export type BookingStatus =
  | "draft"
  | "confirmed"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "draft",
  "confirmed",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "returned",
  "cancelled",
];

export function canCancelBooking(status: BookingStatus): boolean {
  return status === "draft" || status === "confirmed";
}

export type Booking = {
  id: string;
  airwayBillNumber: string;
  source?: string;
  rateCardId?: string | null;
  integrationId?: string | null;
  sender?: ContactAddress;
  receiver?: ContactAddress;
  shipmentDetails?: ShipmentItem[];
  protectionType?: "free" | "opt_out" | "insured";
  protectionValue?: number | null;
  status: BookingStatus;
  shippingCost?: number | null;
  protectionCost?: number;
  tax?: number;
  total: number | null;
  currency: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PageMeta;
  errors?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
};

// ── Mapping ────────────────────────────────────────────────────────────────────

function mapParty(p: Party | Receiver): ContactAddress {
  return {
    name: [p.firstName, p.lastName].filter(Boolean).join(" ").trim(),
    email: p.email,
    phone: `${p.phoneCode}${p.phone}`.trim(),
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2 || undefined,
    city: p.city,
    state: p.stateProvince || undefined,
    zip: p.zipCode || undefined,
    country: (p.country || "").toUpperCase(),
  };
}

function mapParcel(parcel: Parcel): ShipmentItem {
  return {
    weight: Number(parcel.weight),
    weightUnit: "kg",
    dimensions: {
      length: Number(parcel.length),
      width: Number(parcel.width),
      height: Number(parcel.height),
      dimensionUnit: "cm",
    },
    // ponytail: additionalService/remarks are free-text; using parcel.contents
    // as remarks since that's the description field the user fills.
    additionalService:
      parcel.additionalHandling === "yes"
        ? "additional_handling"
        : undefined,
    remarks: parcel.contents || undefined,
    approxItemValue: Number(parcel.itemValue) || 0,
  };
}

export function toCreateBookingBody(
  state: BookingState,
  rateCardId?: string,
): CreateBookingBody {
  const protectionType: CreateBookingBody["protectionType"] =
    state.protection.choice === "opt-out" ? "opt_out" : "free";

  return {
    sender: mapParty(state.sender),
    receiver: mapParty(state.receiver),
    shipmentDetails: state.parcels.map(mapParcel),
    protectionType,
    currency: "NPR",
    ...(rateCardId ? { rateCardId } : {}),
  };
}

// ── Lightweight local validation (before we hit the backend) ──────────────────

export function validateBookingState(state: BookingState): string | null {
  if (state.parcels.length === 0) return "Add at least one parcel.";
  for (const [i, p] of state.parcels.entries()) {
    const label = `Parcel ${i + 1}`;
    if (!positive(p.weight)) return `${label}: enter a weight greater than 0.`;
    if (!positive(p.length) || !positive(p.width) || !positive(p.height))
      return `${label}: enter length, width, and height greater than 0.`;
    if (!p.contents.trim()) return `${label}: describe the contents.`;
  }
  for (const key of ["sender", "receiver"] as const) {
    const p = state[key];
    if (!p.firstName || !p.lastName)
      return `${cap(key)}: first and last name are required.`;
    if (!p.email) return `${cap(key)}: email is required.`;
    if (!p.phone) return `${cap(key)}: phone number is required.`;
    if (!p.addressLine1) return `${cap(key)}: address line 1 is required.`;
    if (!p.city) return `${cap(key)}: city is required.`;
    if (!p.country) return `${cap(key)}: country is required.`;
  }
  if (!state.protection.choice)
    return "Select a protection cover option.";
  if (!state.agreedToTerms) return "You must accept the terms to continue.";
  return null;
}

function positive(v: string): boolean {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Client call ───────────────────────────────────────────────────────────────

export async function createBooking(
  state: BookingState,
  accessToken: string,
  rateCardId?: string,
): Promise<Booking> {
  const body = toCreateBookingBody(state, rateCardId);
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as
    | ApiEnvelope<Booking>
    | null;

  if (!res.ok || !json?.success || !json.data) {
    const fieldMsg = json?.errors?.fieldErrors
      ? Object.values(json.errors.fieldErrors).flat()[0]
      : undefined;
    throw new Error(
      fieldMsg ??
        json?.message ??
        `Booking failed (HTTP ${res.status}). Try again.`,
    );
  }
  return json.data;
}

// ── Read/cancel helpers ───────────────────────────────────────────────────────

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function listBookings(
  {
    page = 1,
    limit = 20,
    status,
  }: { page?: number; limit?: number; status?: BookingStatus },
  accessToken: string,
): Promise<{ items: Booking[]; meta: PageMeta }> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  const res = await fetch(`${API_URL}/bookings?${qs.toString()}`, {
    headers: bearer(accessToken),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as
    | ApiEnvelope<Booking[]>
    | null;
  if (!res.ok || !json?.success || !json.data || !json.meta) {
    throw new Error(json?.message ?? `Could not load bookings (HTTP ${res.status}).`);
  }
  return { items: json.data, meta: json.meta };
}

export async function getBooking(
  id: string,
  accessToken: string,
): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    headers: bearer(accessToken),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as
    | ApiEnvelope<Booking>
    | null;
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `Could not load booking (HTTP ${res.status}).`);
  }
  return json.data;
}

export async function cancelBooking(
  id: string,
  accessToken: string,
): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
    method: "POST",
    headers: bearer(accessToken),
  });
  const json = (await res.json().catch(() => null)) as
    | ApiEnvelope<Booking>
    | null;
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `Could not cancel booking (HTTP ${res.status}).`);
  }
  return json.data;
}
