import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-white py-20 lg:py-28">
        <div className="container-content">
          <div className="mx-auto max-w-[640px] text-center">
            <p
              aria-hidden="true"
              className="text-[8rem] sm:text-[10rem] lg:text-[12rem] font-extrabold leading-none tracking-tight text-[var(--color-accent)]"
            >
              404
            </p>

            <h1 className="mt-4 text-[1.75rem] lg:text-[2.25rem] font-extrabold text-[var(--color-text)] tracking-tight">
              This shipment went off-route
            </h1>

            <p className="mt-4 text-[15px] text-[var(--color-text-body)]/70">
              The page you&apos;re looking for isn&apos;t on the map. It may have moved, or never existed.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--color-accent)] text-white text-[14px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Back to home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text)] text-[14px] font-semibold hover:border-[var(--color-text-body)]/40 hover:bg-[var(--color-surface)] transition-colors"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
