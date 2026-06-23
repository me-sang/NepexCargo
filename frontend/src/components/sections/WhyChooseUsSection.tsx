import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    title: "Fast Delivery",
    description: "Instant Local Delivery Services within 2 hours Max.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {/* Rocket body */}
        <path d="M12 2c3.5 0 6 3 6 6.5V14l-3 3h-6l-3-3V8.5C6 5 8.5 2 12 2z" />
        <circle cx="12" cy="9" r="1.5" fill="#FFFFFF" />
        {/* Fins */}
        <path d="M6 14l-3 3v3l4-2v-2l-1-2zM18 14l3 3v3l-4-2v-2l1-2z" fillOpacity="0.55" />
        {/* Flame */}
        <path d="M10 18l1 4h2l1-4z" fillOpacity="0.7" />
      </svg>
    ),
  },
  {
    title: "Reliability",
    description: "We deliver on time with precision, care, and consistency.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7-4.5-7-11a5 5 0 019-3 5 5 0 019 3c0 6.5-7 11-7 11z" />
        <path
          d="M9 11l2 2 4-4"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Transparency",
    description: "Track every shipment in real-time. Stay informed from start to finish.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative bg-[var(--color-surface)] py-20 lg:py-28 overflow-hidden">
      {/* Dotted world map pattern — anchored upper-center, fades into the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 top-0 h-full opacity-[0.55]"
        style={{
          backgroundImage: "url('/svgs/earth-pattern.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center -40px",
          backgroundSize: "min(1400px, 110%) auto",
          maskImage:
            "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 container-content">
        <SectionHeader
          eyebrow="Why Choose Us"
          title="Built for shippers who don't compromise"
          description="Promises that shape every shipment we handle from first quote to final mile."
          align="center"
          className="mb-14 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="bg-white rounded-[var(--radius-xl)] p-7 lg:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-lg)] transition-shadow"
            >
              <div className="text-[var(--color-accent)] mb-7">
                {feature.icon}
              </div>
              <h3 className="text-[18px] font-bold text-[var(--color-text)] mb-2.5">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#56707A] leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
