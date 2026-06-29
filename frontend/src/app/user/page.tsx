import Link from "next/link";
import { auth } from "@/auth";

// Temporary debug page — dumps the current Auth.js session so we can eyeball
// what's actually in the cookie. Remove once the dashboard surfaces this.
export default async function UserDebugPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="container-content py-12 lg:py-16">
      <header className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-text-body)]/55">
          Debug
        </p>
        <h1 className="mt-2 text-[1.75rem] font-extrabold text-[var(--color-text)] leading-none tracking-tight">
          /user — current session
        </h1>
      </header>

      {user ? (
        <div className="space-y-6">
          <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <Row label="ID" value={user.id ?? "—"} />
            <Row label="Name" value={user.name ?? "—"} />
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Image" value={user.image ?? "—"} />
            <Row label="Session expires" value={session.expires ?? "—"} />
          </dl>

          <details className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <summary className="text-[13px] font-semibold text-[var(--color-text)] cursor-pointer">
              Raw session JSON
            </summary>
            <pre className="mt-4 overflow-auto text-[12px] text-[var(--color-text-body)] bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4">
{JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <p className="text-[14px] text-[var(--color-text-body)]">
            No active session.
          </p>
          <Link
            href="/login?callbackUrl=/user"
            className="mt-4 inline-flex items-center justify-center h-10 px-5 rounded-full bg-[var(--color-accent)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Go to login
          </Link>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[var(--color-text-body)]/55">
        {label}
      </dt>
      <dd className="text-[14px] text-[var(--color-text)] break-all font-mono">
        {value}
      </dd>
    </>
  );
}
