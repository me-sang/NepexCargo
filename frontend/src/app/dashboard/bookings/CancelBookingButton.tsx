"use client";

import { useState, useTransition } from "react";
import { cancelBookingAction } from "./actions";

export function CancelBookingButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(id);
      if (!result.ok) setError(result.error);
      else setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-alert)] text-[13px] font-semibold text-[var(--color-alert)] hover:bg-[var(--color-alert)]/10 transition-colors"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] text-[var(--color-text)]">
        Cancel this booking?
      </span>
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="h-9 px-3 rounded-[var(--radius-md)] bg-[var(--color-alert)] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Yes, cancel"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
      >
        Keep it
      </button>
      {error && (
        <p role="alert" className="w-full text-[12px] text-[var(--color-alert)]">
          {error}
        </p>
      )}
    </div>
  );
}
