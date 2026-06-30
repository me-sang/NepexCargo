import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardIndexPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[1.75rem] font-extrabold text-[var(--color-text)] leading-none tracking-tight">
          Overview
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-text-body)]/70">
          Welcome back. Here&apos;s what&apos;s happening with your shipments today.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Bookings" value="0" hint="No bookings yet" />
        <StatCard label="In Transit" value="0" hint="—" />
        <StatCard label="Delivered (this month)" value="0" hint="—" />
        <StatCard label="Revenue (this month)" value="$0.00" hint="—" />
      </section>

      <section className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1rem] font-bold text-[var(--color-text)]">
              Recent bookings
            </h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-body)]/65">
              A timeline of your most recent shipments.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center h-32 border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] text-[13px] text-[var(--color-text-body)]/55">
          No bookings yet — create your first one to see it here.
        </div>
      </section>
    </div>
  );
}
