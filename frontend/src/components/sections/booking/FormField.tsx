import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldControlBase =
  "h-11 w-full rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] px-4 text-[14px] text-[var(--color-text)] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[var(--color-accent)]";

export function Field({
  label,
  required,
  hint,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[13px] font-semibold text-[var(--color-text)] mb-1.5">
        {label}
        {required && <span className="text-[var(--color-alert)] ml-0.5">*</span>}
        {hint && (
          <span className="ml-1 font-normal text-[var(--color-text-body)]/70">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldControlBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[92px] w-full rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] px-4 py-3 text-[14px] text-[var(--color-text)] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[var(--color-accent)] ${props.className ?? ""}`}
    />
  );
}

export function Select({
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={`${fieldControlBase} appearance-none pr-9 ${rest.className ?? ""}`}
      >
        {children}
      </select>
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
    </div>
  );
}

export function RadioRow({
  name,
  value,
  onChange,
  required,
}: {
  name: string;
  value: "yes" | "no" | "";
  onChange: (v: "yes" | "no") => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-6 pt-1">
      {(["no", "yes"] as const).map((opt) => (
        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            required={required}
            className="h-4 w-4 accent-[var(--color-accent)] cursor-pointer"
          />
          <span className="text-[14px] text-[var(--color-text)] capitalize">
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}
