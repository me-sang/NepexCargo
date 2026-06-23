import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Fast Delivery",
    description: "Instant Local Delivery Services within 2 hours Max.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Reliability",
    description: "We deliver on time with precision, care, and consistency.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: "Transparency",
    description: "Track every shipment in real-time. Stay informed from start to finish.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative py-20 md:py-24 bg-surface overflow-hidden">
      {/* Decorative dot-circle pattern */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <div className="relative w-[700px] h-[700px] opacity-40">
          {/* Concentric rings of dots */}
          {[120, 200, 280, 340].map((r, ri) => {
            const count = [12, 20, 28, 36][ri];
            return Array.from({ length: count }).map((_, i) => {
              const angle = (i / count) * 2 * Math.PI;
              const x = 350 + r * Math.cos(angle);
              const y = 350 + r * Math.sin(angle);
              return (
                <div
                  key={`${ri}-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/25"
                  style={{ left: x - 3, top: y - 3 }}
                />
              );
            });
          })}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="WHY CHOOSE US"
          title="Built for shippers who don't compromise"
          description="Promises that shape every shipment we handle from first quote to final mile."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-border/60"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
