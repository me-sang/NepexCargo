"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Field, TextInput, Textarea, Select, RadioRow } from "./FormField";
import { CountryDropdown } from "@/components/ui/CountryDropdown";
import { countryName } from "@/lib/countries";

export type Parcel = {
  dimensionPreset: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  additionalHandling: "yes" | "no" | "";
  packAndLabel: "yes" | "no" | "";
  contents: string;
  itemValue: string;
};

export type Party = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phoneCode: string;
  phone: string;
  altPhoneCode: string;
  altPhone: string;
  addressSearch: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  country: string;
};

export type Receiver = Party & { isResidential: boolean };

export type Route = {
  fromCountry: string;
  toCountry: string;
  fromCity: string;
  toCity: string;
  fromZip: string;
  toZip: string;
};

export type ProtectionChoice = "free" | "opt-out" | "";

export type BookingState = {
  parcels: Parcel[];
  route: Route;
  sender: Party;
  receiver: Receiver;
  protection: { choice: ProtectionChoice };
  agreedToTerms: boolean;
};

const emptyParcel: Parcel = {
  dimensionPreset: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  additionalHandling: "",
  packAndLabel: "",
  contents: "",
  itemValue: "",
};

const emptyParty: Party = {
  firstName: "",
  lastName: "",
  organization: "",
  email: "",
  phoneCode: "+977",
  phone: "",
  altPhoneCode: "+977",
  altPhone: "",
  addressSearch: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  zipCode: "",
  country: "",
};

const emptyRoute: Route = {
  fromCountry: "",
  toCountry: "",
  fromCity: "",
  toCity: "",
  fromZip: "",
  toZip: "",
};

export const initialBookingState: BookingState = {
  parcels: [{ ...emptyParcel }],
  route: { ...emptyRoute },
  sender: { ...emptyParty },
  receiver: { ...emptyParty, isResidential: false },
  protection: { choice: "" },
  agreedToTerms: false,
};

// ponytail: hardcoded lists. Wire to backend /geo endpoints when they exist.
const DIMENSION_PRESETS = [
  "Envelope (≤ 1 kg)",
  "Small Box (≤ 5 kg)",
  "Medium Box (≤ 15 kg)",
  "Large Box (≤ 30 kg)",
  "Custom",
];
const PHONE_CODES = ["+977", "+91", "+1", "+44", "+61", "+971", "+81", "+65"];

type StateSetter<T> = Dispatch<SetStateAction<T>>;

/* ------------------------------ Shipment step ------------------------------ */

export function ShipmentStep({
  state,
  setState,
}: {
  state: BookingState;
  setState: StateSetter<BookingState>;
}) {
  function updateParcel(index: number, patch: Partial<Parcel>) {
    setState((s) => ({
      ...s,
      parcels: s.parcels.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }
  function addParcel() {
    setState((s) => ({ ...s, parcels: [...s.parcels, { ...emptyParcel }] }));
  }
  function duplicate(index: number) {
    setState((s) => ({
      ...s,
      parcels: [...s.parcels, { ...s.parcels[index] }],
    }));
  }
  function remove(index: number) {
    setState((s) => ({
      ...s,
      parcels: s.parcels.filter((_, i) => i !== index),
    }));
  }
  function updateRoute(patch: Partial<Route>) {
    setState((s) => ({ ...s, route: { ...s.route, ...patch } }));
  }

  return (
    <>
      <h2 className="text-[1.375rem] font-extrabold text-[var(--color-text)]">
        Shipment Details
      </h2>

      <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] px-4 py-3">
        <p className="text-[13px] text-[var(--color-text)]">
          <span aria-hidden="true" className="mr-2">
            ⓘ
          </span>
          Subject to restricted items list
        </p>
        <a
          href="#"
          className="text-[13px] font-semibold text-[var(--color-accent)] underline underline-offset-2"
        >
          View restricted items
        </a>
      </div>

      <div className="mt-6 space-y-8">
        {state.parcels.map((parcel, i) => {
          const isLastParcel = i === state.parcels.length - 1;
          return (
            <div
              key={i}
              className={
                i > 0 ? "border-t border-[var(--color-border)] pt-8" : ""
              }
            >
              <ParcelFields
                parcel={parcel}
                index={i}
                onChange={(patch) => updateParcel(i, patch)}
              />

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {isLastParcel ? (
                  <button
                    type="button"
                    onClick={addParcel}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-accent)] text-[13px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
                  >
                    <PlusIcon />
                    Add another parcel
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => duplicate(i)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-accent)] text-[13px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                    Duplicate this parcel
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={state.parcels.length === 1}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-alert)] text-[13px] font-semibold text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[var(--color-border)] pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Sending from" required>
            <CountryDropdown
              value={state.route.fromCountry}
              onChange={(code) => updateRoute({ fromCountry: code })}
              placeholder="Select a country"
              required
            />
          </Field>
          <Field label="Sending to" required>
            <CountryDropdown
              value={state.route.toCountry}
              onChange={(code) => updateRoute({ toCountry: code })}
              placeholder="Select a country"
              required
            />
          </Field>
          <Field label="City">
            <TextInput
              placeholder="Enter a city"
              value={state.route.fromCity}
              onChange={(e) => updateRoute({ fromCity: e.target.value })}
            />
          </Field>
          <Field label="City">
            <TextInput
              placeholder="Enter a city"
              value={state.route.toCity}
              onChange={(e) => updateRoute({ toCity: e.target.value })}
            />
          </Field>
          <Field label="Zip Code">
            <TextInput
              placeholder="Enter a zip code"
              value={state.route.fromZip}
              onChange={(e) => updateRoute({ fromZip: e.target.value })}
            />
          </Field>
          <Field label="Zip Code">
            <TextInput
              placeholder="Enter a zip code"
              value={state.route.toZip}
              onChange={(e) => updateRoute({ toZip: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ParcelFields({
  parcel,
  index,
  onChange,
}: {
  parcel: Parcel;
  index: number;
  onChange: (patch: Partial<Parcel>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Dimensions" required>
          <Select
            value={parcel.dimensionPreset}
            onChange={(e) => onChange({ dimensionPreset: e.target.value })}
            required
          >
            <option value="" disabled>
              Select a dimension
            </option>
            {DIMENSION_PRESETS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Weight (kg)">
          <TextInput
            type="number"
            min={0.01}
            step="0.01"
            placeholder="Enter weight"
            value={parcel.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Length (cm)">
          <TextInput
            type="number"
            min={0}
            placeholder="Enter length"
            value={parcel.length}
            onChange={(e) => onChange({ length: e.target.value })}
          />
        </Field>
        <Field label="Width (cm)">
          <TextInput
            type="number"
            min={0}
            placeholder="Enter width"
            value={parcel.width}
            onChange={(e) => onChange({ width: e.target.value })}
          />
        </Field>
        <Field label="Height (cm)">
          <TextInput
            type="number"
            min={0}
            placeholder="Enter height"
            value={parcel.height}
            onChange={(e) => onChange({ height: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Additional handling required?">
          <RadioRow
            name={`handling-${index}`}
            value={parcel.additionalHandling}
            onChange={(v) => onChange({ additionalHandling: v })}
          />
        </Field>
        <Field label="I want UPS to pack and label my item for me">
          <RadioRow
            name={`pack-${index}`}
            value={parcel.packAndLabel}
            onChange={(v) => onChange({ packAndLabel: v })}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Contents" required>
          <Textarea
            placeholder="Please provide a clear description of the item(s) in your parcel."
            value={parcel.contents}
            onChange={(e) => onChange({ contents: e.target.value })}
            required
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Item Value ($)">
          <TextInput
            type="number"
            min={0}
            step="0.01"
            placeholder="Enter value"
            value={parcel.itemValue}
            onChange={(e) => onChange({ itemValue: e.target.value })}
            className="sm:max-w-[280px]"
          />
        </Field>
      </div>
    </>
  );
}

/* -------------------------------- Party step ------------------------------- */

export function PartyStep({
  partyKey,
  title,
  addressLabel,
  withResidentialCheckbox,
  state,
  setState,
}: {
  partyKey: "sender" | "receiver";
  title: string;
  addressLabel: string;
  withResidentialCheckbox?: boolean;
  state: BookingState;
  setState: StateSetter<BookingState>;
}) {
  const party = state[partyKey];

  function update(patch: Partial<Receiver>) {
    setState((s) => ({ ...s, [partyKey]: { ...s[partyKey], ...patch } }));
  }

  const [manualOpen, setManualOpen] = useState(true);

  return (
    <>
      <h2 className="text-[1.375rem] font-extrabold text-[var(--color-text)]">
        {title}
      </h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" required>
          <TextInput
            placeholder="John"
            value={party.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            required
          />
        </Field>
        <Field label="Last Name" required>
          <TextInput
            placeholder="Doe"
            value={party.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            required
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Organization" hint="(Optional)">
          <TextInput
            placeholder="Nepex Cargo Pvt. Ltd"
            value={party.organization}
            onChange={(e) => update({ organization: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Email Address" required>
          <TextInput
            type="email"
            placeholder="nepexcargo@gmail.com"
            value={party.email}
            onChange={(e) => update({ email: e.target.value })}
            required
          />
        </Field>
        <PhoneField
          label="Phone Number"
          required
          code={party.phoneCode}
          number={party.phone}
          onCode={(v) => update({ phoneCode: v })}
          onNumber={(v) => update({ phone: v })}
        />
        <PhoneField
          label="Alternative Number"
          hint="(Optional)"
          code={party.altPhoneCode}
          number={party.altPhone}
          onCode={(v) => update({ altPhoneCode: v })}
          onNumber={(v) => update({ altPhone: v })}
        />
      </div>

      <h3 className="mt-8 text-[1.125rem] font-extrabold text-[var(--color-text)]">
        {addressLabel}
      </h3>

      <div className="mt-4">
        <Field label="Search for an address">
          <div className="relative">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-body)]/55"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="e.g. 66801, Emporia"
              value={party.addressSearch}
              onChange={(e) => update({ addressSearch: e.target.value })}
              className="h-11 w-full rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] pl-9 pr-9 text-[14px] text-[var(--color-text)] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[var(--color-accent)]"
            />
            {party.addressSearch && (
              <button
                type="button"
                onClick={() => update({ addressSearch: "" })}
                aria-label="Clear"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-border)]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setManualOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-accent)] text-[13px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
        >
          <PlusIcon />
          Add address manually
        </button>
      </div>

      {manualOpen && (<>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Address line 1" required>
          <TextInput
            placeholder="Bishalnagar, Kathmandu"
            value={party.addressLine1}
            onChange={(e) => update({ addressLine1: e.target.value })}
            required
          />
        </Field>
        <Field label="Address line 2" hint="(optional)">
          <TextInput
            placeholder="Bishalnagar, Kathmandu"
            value={party.addressLine2}
            onChange={(e) => update({ addressLine2: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Town/City" required>
          <TextInput
            placeholder="Emporia"
            value={party.city}
            onChange={(e) => update({ city: e.target.value })}
            required
          />
        </Field>
        <Field label="State/County/Province" required>
          <TextInput
            placeholder="Kansas"
            value={party.stateProvince}
            onChange={(e) => update({ stateProvince: e.target.value })}
            required
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Zip / Postal Code" required>
          <TextInput
            placeholder="66801"
            value={party.zipCode}
            onChange={(e) => update({ zipCode: e.target.value })}
            required
          />
        </Field>
        <Field label="Country" required>
          <CountryDropdown
            value={party.country}
            onChange={(code) => update({ country: code })}
            placeholder="Select a country"
            required
          />
        </Field>
      </div>

      {withResidentialCheckbox && (
        <label className="mt-4 inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(party as Receiver).isResidential}
            onChange={(e) => update({ isResidential: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)] cursor-pointer"
          />
          <span className="text-[14px] text-[var(--color-text)]">
            This is a residential address
          </span>
        </label>
      )}
      </>)}
    </>
  );
}

function PhoneField({
  label,
  hint,
  required,
  code,
  number,
  onCode,
  onNumber,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  code: string;
  number: string;
  onCode: (v: string) => void;
  onNumber: (v: string) => void;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      <div className="flex gap-2">
        <div className="w-[90px] shrink-0">
          <Select value={code} onChange={(e) => onCode(e.target.value)}>
            {PHONE_CODES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <TextInput
          type="tel"
          placeholder="9800000000"
          value={number}
          onChange={(e) => onNumber(e.target.value)}
          required={required}
        />
      </div>
    </Field>
  );
}

/* ----------------------------- Protection step ----------------------------- */

// ponytail: declared coverage value is hardcoded — swap when backend returns it.
const PROTECTION_VALUE = "NPR. 9,000";

export function ProtectionStep({
  state,
  setState,
}: {
  state: BookingState;
  setState: StateSetter<BookingState>;
}) {
  function setChoice(choice: ProtectionChoice) {
    setState((s) => ({ ...s, protection: { choice } }));
  }

  return (
    <>
      <h2 className="text-[1.375rem] font-extrabold text-[var(--color-text)]">
        Protection Cover Details
      </h2>
      <p className="mt-2 text-[14px] text-[var(--color-text-body)] max-w-[560px]">
        Secure your shipment against loss or damage. Select the coverage option
        that best fits your cargo&apos;s value.
      </p>

      <div className="mt-6 space-y-3">
        <ProtectionOption
          selected={state.protection.choice === "free"}
          onSelect={() => setChoice("free")}
          title="Free Protection"
          badge="RECOMMENDED"
          description={`I would like to add protection cover to my shipment to the value of ${PROTECTION_VALUE}`}
          footer={
            <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)]">
              <ShieldCheckIcon />
              Standard Liability Included
            </span>
          }
        />
        <ProtectionOption
          selected={state.protection.choice === "opt-out"}
          onSelect={() => setChoice("opt-out")}
          title="Opt-out"
          description="I would like to opt-out of the free protection cover as the item I'm shipping is carried on a no compensation basis or is of negligible value."
        />
      </div>

      <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-wrap items-start gap-5">
        <div className="w-[190px] shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4 text-center">
          <span className="block text-[1.25rem] font-extrabold tracking-tight text-[#1E3A8A]">
            Ship<span className="text-[#3B82F6]">surance</span>
          </span>
          <span className="block text-[10px] text-[var(--color-text-body)]/70 mt-0.5">
            by Assurant
          </span>
          <span className="mt-4 block text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--color-text-body)]/60">
            Coverage Partner
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-[var(--color-text)]">
            Insured by Shipsurance
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-body)]">
            Shipsurance provides shipping insurance coverage for packages sent
            through our platform. By purchasing coverage you agree to their
            coverage terms.
          </p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-accent)] hover:underline"
          >
            View Coverage Terms →
          </a>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[13px] text-[var(--color-text-body)]">
          All shipments are subject to our service regulations and compliance
          standards:
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-5">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)] hover:underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            Restricted Items
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent)] hover:underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
            </svg>
            Terms and Conditions
          </a>
        </div>
      </div>
    </>
  );
}

function ProtectionOption({
  selected,
  onSelect,
  title,
  badge,
  description,
  footer,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  badge?: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full text-left rounded-[var(--radius-md)] border p-5 transition-colors ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/60"
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 ${
            selected
              ? "border-[var(--color-accent)]"
              : "border-[var(--color-border)]"
          }`}
        >
          {selected && (
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-[15px] font-extrabold ${
                selected
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text)]"
              }`}
            >
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[#16A34A]">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-body)]">
            {description}
          </p>
          {footer}
        </div>
      </div>
    </button>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ------------------------------- Confirm step ------------------------------ */

export function ConfirmStep({
  state,
  setState,
}: {
  state: BookingState;
  setState: StateSetter<BookingState>;
}) {
  const senderName =
    [state.sender.firstName, state.sender.lastName].filter(Boolean).join(" ") ||
    "USPS Drop-off";
  const receiverName =
    [state.receiver.firstName, state.receiver.lastName]
      .filter(Boolean)
      .join(" ") || "Recipient";

  return (
    <>
      <h2 className="text-[1.375rem] font-extrabold text-[var(--color-text)]">
        Confirm your Booking
      </h2>

      <div className="mt-5 rounded-[var(--radius-md)] border border-[#F87171] bg-[#FEE2E2]/50 p-4 flex items-start gap-3">
        <span aria-hidden="true" className="text-[#DC2626] shrink-0 mt-0.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 8a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1zm0 8a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold tracking-[0.06em] text-[#DC2626]">
            IMPORTANT
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#B91C1C]">
            Please take a moment to check all the details of your shipment.
            Once your booking is processed by the courier it&apos;s often not
            possible to change the details without canceling and rebooking a
            new shipment.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <AddressCard
          eyebrow="FROM"
          title={senderName}
          lines={buildAddressLines(state.sender, state.route.fromCountry)}
          note="Drop off your packages at any USPS location."
        />
        <AddressCard
          eyebrow="TO"
          title={receiverName}
          lines={buildAddressLines(state.receiver, state.route.toCountry)}
        />
        <AddressCard
          eyebrow="RETURN TO"
          title="Nepex Logistics Center"
          lines={buildAddressLines(state.sender, state.route.fromCountry)}
        />
      </div>

      <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[1.0625rem] font-extrabold text-[var(--color-text)]">
          Terms &amp; Conditions
        </h3>
        <ul className="mt-3 space-y-2.5">
          <li className="flex items-start gap-2.5 text-[13px] text-[var(--color-text)]">
            <CheckCircleIcon />
            <span>
              I confirm that this Shipment complies with the following list of{" "}
              <a
                href="#"
                className="font-semibold text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Restricted Items
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-[13px] text-[var(--color-text)]">
            <CheckCircleIcon />
            <span>
              I understand that this Service is provided by a Courier Partner
              and agree to their{" "}
              <a
                href="#"
                className="font-semibold text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Terms &amp; Conditions
              </a>
            </span>
          </li>
        </ul>
        <label className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-white/70 border border-[var(--color-border)] p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.agreedToTerms}
            onChange={(e) =>
              setState((s) => ({ ...s, agreedToTerms: e.target.checked }))
            }
            required
            className="h-4 w-4 mt-0.5 accent-[var(--color-accent)] cursor-pointer"
          />
          <span className="text-[13px] text-[var(--color-text)]">
            I have read, understood and agree to all of the terms stated above.
          </span>
        </label>
      </div>
    </>
  );
}

function AddressCard({
  eyebrow,
  title,
  lines,
  note,
}: {
  eyebrow: string;
  title: string;
  lines: string[];
  note?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-accent)]">
        {eyebrow}
      </p>
      <p className="mt-2 text-[15px] font-extrabold text-[var(--color-text)]">
        {title}
      </p>
      {lines.length > 0 && (
        <div className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-body)]">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}
      {note && (
        <p className="mt-2 text-[12px] italic text-[var(--color-text-body)]/75">
          {note}
        </p>
      )}
      <a
        href="#"
        className="mt-3 inline-block text-[13px] font-semibold text-[var(--color-accent)] hover:underline"
      >
        Change address
      </a>
    </div>
  );
}

function buildAddressLines(party: Party, fallbackCountry: string): string[] {
  const l1 = [party.addressLine1, party.addressLine2].filter(Boolean).join(", ");
  const l2 = [
    party.city,
    party.stateProvince,
    party.zipCode,
    party.country
      ? countryName(party.country)
      : fallbackCountry
        ? countryName(fallbackCountry)
        : "",
  ]
    .filter(Boolean)
    .join(", ");
  return [l1, l2].filter(Boolean);
}

function CheckCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 mt-[1px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="var(--color-accent-soft)" />
      <path
        d="m8 12 3 3 5-6"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
