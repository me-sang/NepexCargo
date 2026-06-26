const stats = [
  { value: "9+", label: "Years of Experience" },
  { value: "600K+", label: "Packages delivered yearly" },
  { value: "24/7", label: "Customer Support" },
];

export function StatsSection() {
  return (
    <section className="bg-[var(--color-surface)] pt-2 pb-20 lg:pb-24">
      <div className="container-content">
        {/* Inset dark card with map-background photographic bg */}
        <div className="relative rounded-[var(--radius-xl)] overflow-hidden">
          {/* Background: dark navy base + map image overlaid */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(110deg, #0A2A33 0%, #0F4456 55%, #1B7E96 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-65"
            style={{ backgroundImage: "url('/map-background.png')" }}
          />
          {/* Left-side darkening so text stays legible over the map */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(9,36,43,0.7) 0%, rgba(9,36,43,0.45) 45%, rgba(9,36,43,0.1) 100%)",
            }}
          />

          {/* Content */}
          <div className="relative px-7 sm:px-10 lg:px-14 py-12 lg:py-16">
            <h2 className="text-[2rem] sm:text-[2.25rem] lg:text-[2.5rem] font-extrabold text-white leading-[1.1] tracking-tight max-w-2xl">
              One network,{" "}
              <span className="text-[var(--color-accent)]">220+</span> countries.
            </h2>
            <p className="mt-5 text-[15px] text-white/85 leading-relaxed max-w-md">
              From Dubai to Detroit, our routes span every major trade lane — air,
              sea and ground — backed by real-time visibility.
            </p>

            {/* Stats — left-aligned row at the bottom */}
            <div className="mt-12 lg:mt-16 grid grid-cols-3 gap-6 sm:gap-10 lg:gap-14 max-w-xl">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold text-[var(--color-accent)] leading-none tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[12px] sm:text-[13px] text-white/80 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
