export function CTASection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-content">
        {/* Inset banner card */}
        <div className="relative rounded-[var(--radius-xl)] overflow-hidden">
          {/* Photographic backdrop (airplane / ship / truck silhouettes, teal-tinted) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/get-quote-bg.png')" }}
          />
          {/* Dark teal scrim for headline legibility */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,36,43,0.55) 0%, rgba(9,36,43,0.75) 100%)",
            }}
          />

          {/* Content */}
          <div className="relative px-6 sm:px-10 lg:px-14 py-16 lg:py-20 text-center">
            <h2 className="text-[1.875rem] sm:text-[2.25rem] lg:text-[2.625rem] font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl mx-auto">
              Let&apos;s move your business forward
            </h2>
            <p className="mt-4 lg:mt-5 text-[15px] lg:text-base text-white/85 leading-relaxed max-w-xl mx-auto">
              Fast, reliable, and customized logistics solutions at your
              fingertips. No commitments, no hidden fees.
            </p>
            <a
              href="/quote"
              className="mt-8 lg:mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[var(--color-text)] text-[14px] font-semibold hover:bg-white/95 transition-colors shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]"
            >
              Get a Free Quote
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
