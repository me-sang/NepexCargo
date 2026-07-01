"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, type Country } from "@/lib/countries";

export function CountryDropdown({
  value,
  onChange,
  placeholder = "Select a country",
  required,
  options = COUNTRIES,
  buttonClassName = "",
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  options?: Country[];
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query, options]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`h-11 w-full rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] pl-3 pr-9 text-[14px] focus:outline-none focus:border-[var(--color-accent)] text-left inline-flex items-center gap-2.5 ${
          selected ? "text-[var(--color-text)]" : "text-[#9CA3AF]"
        } ${buttonClassName}`}
      >
        {selected ? (
          <>
            <FlagBox code={selected.code} />
            <span className="truncate">{selected.name}</span>
          </>
        ) : (
          <span className="truncate">{placeholder}</span>
        )}
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
          className="ml-auto text-[var(--color-text-body)]/55 shrink-0"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* ponytail: sr-only mirror keeps native `required` submission-blocking. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          onChange={() => {}}
          required
          className="sr-only"
        />
      )}

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card-lg)] overflow-hidden">
          <div className="border-b border-[var(--color-border)] p-2">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search countries…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)] placeholder:text-[#9CA3AF] focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-[260px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-[var(--color-text-body)]/70">
                No matches.
              </li>
            ) : (
              filtered.map((c) => {
                const isSel = c.code === value;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c.code);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-[14px] hover:bg-[var(--color-surface)] ${
                        isSel ? "bg-[var(--color-surface)] font-semibold" : ""
                      }`}
                    >
                      <FlagBox code={c.code} />
                      <span className="truncate text-[var(--color-text)]">
                        {c.name}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function FlagBox({ code }: { code: string }) {
  return (
    <span
      aria-hidden="true"
      className={`fi fi-${code.toLowerCase()} shrink-0 rounded-[2px]`}
      style={{ width: 22, height: 16, display: "inline-block" }}
    />
  );
}
