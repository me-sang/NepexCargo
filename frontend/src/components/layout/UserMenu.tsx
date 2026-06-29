"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!session?.user) return null;

  const name = session.user.name ?? "Account";
  const email = session.user.email ?? "";
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-full border border-white/45 hover:border-white/85 transition-colors"
      >
        <span className="h-8 w-8 rounded-full bg-white text-[var(--color-brand)] inline-flex items-center justify-center font-bold text-[13px]">
          {initial}
        </span>
        <span className="hidden xl:inline max-w-[140px] truncate text-[13px] font-semibold text-white">
          {name}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 8.5L1.5 4h9z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-[var(--radius-md)] bg-white shadow-lg border border-[var(--color-border)] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-[13px] font-bold text-[var(--color-text)] truncate">{name}</p>
            {email && (
              <p className="text-[12px] text-[var(--color-text-body)]/70 truncate">{email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
            className="w-full text-left px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
