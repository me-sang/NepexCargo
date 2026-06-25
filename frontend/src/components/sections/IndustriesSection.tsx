const industries = [
  {
    title: "Industrial & Manufacturing",
    description: "Just-in-time heavy transport for manufacturing logistics.",
    bg: "linear-gradient(135deg, #09242B 0%, #1B7E96 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 20V8l5 3V8l5 3V8l5 3V8l5 3v9H2z" />
        <path d="M9 14h2M14 14h2M9 17h2M14 17h2" />
      </svg>
    ),
  },
  {
    title: "Retail & E-Commerce",
    description: "Fast, scalable delivery for retail and online sales.",
    bg: "linear-gradient(135deg, #0D3641 0%, #2390AC 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9h18l-2 11H5L3 9z" />
        <path d="M8 9V6a4 4 0 018 0v3" />
      </svg>
    ),
  },
  {
    title: "Food & Beverage",
    description: "Temperature-controlled transport from farm to market.",
    bg: "linear-gradient(135deg, #1B4D2E 0%, #2390AC 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 2v20M7 2v8a2 2 0 002 2h0a2 2 0 002-2V2" />
        <path d="M17 14v8M17 2a3 3 0 013 3v7h-3" />
      </svg>
    ),
  },
];

export function IndustriesSection() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {industries.map((industry) => (
            <article
              key={industry.title}
              className="group relative rounded-[var(--radius-xl)] overflow-hidden aspect-[4/5] cursor-pointer transition-transform hover:-translate-y-1"
              style={{ background: industry.bg }}
            >
              {/* Photo placeholder texture */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
                }}
              />

              {/* Dark overlay */}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#09242B]/85 via-[#09242B]/30 to-transparent" />

              {/* Icon top-left */}
              <div className="absolute top-5 left-5 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                {industry.icon}
              </div>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-1.5 leading-tight">
                  {industry.title}
                </h3>
                <p className="text-[13px] text-white/85 leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
