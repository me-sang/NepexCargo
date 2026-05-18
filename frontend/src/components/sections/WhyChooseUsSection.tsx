import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Fast Delivery",
    description: "Instant Local Delivery Services within 2 hours Max.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Reliability",
    description: "We deliver on time with precision, care, and consistency.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    title: "Transparency",
    description: "Track every shipment in real-time. Stay informed from start to finish.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative py-20 md:py-28 bg-[#F5F7F9] overflow-hidden">
      {/* Earth pattern background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <Image
          src="/svgs/earth-pattern.svg"
          alt=""
          width={1198}
          height={600}
          className="w-full max-w-5xl opacity-30"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="WHY CHOOSE US"
          title="Built for shippers who don't compromise"
          description="Promises that shape every shipment we handle from first quote to final mile."
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-[#E5E7EB]"
            >
              <div className="w-14 h-14 rounded-xl bg-[#E8F7FC] flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1B2B3B] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
