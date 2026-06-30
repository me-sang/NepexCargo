export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--color-text-body)]/55">
        {label}
      </p>
      <p className="mt-3 text-[1.875rem] font-extrabold text-[var(--color-text)] leading-none tracking-tight">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-[12px] text-[var(--color-text-body)]/60">{hint}</p>
      )}
    </div>
  );
}
