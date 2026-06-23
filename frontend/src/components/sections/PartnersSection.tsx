import { SectionHeader } from "@/components/ui/SectionHeader";

const partnersRow1 = [
  { name: "Logistics Transportation", short: "LOGISTICS" },
  { name: "Alphalead Express", short: "ALPHALEAD EXPRESS" },
  { name: "Hegelmann", short: "HEGELMANN" },
  { name: "MTL", short: "MTL" },
];

const partnersRow2 = [
  { name: "Logline", short: "LOGLINE" },
  { name: "ace logistics", short: "ace logistics" },
  { name: "Alioth Spedycja", short: "ALIOTH SPEDYCJA" },
  { name: "KJTT", short: "KJTT" },
  { name: "FlyEx", short: "FlyEx" },
  { name: "XCEL LogiSolutions", short: "XCEL LOGISOLUTIONS" },
];

function PartnerLogo({ name, short }: { name: string; short: string }) {
  return (
    <div className="flex items-center justify-center px-4 py-4 bg-white rounded-xl border border-border hover:shadow-sm transition-shadow min-h-[72px]">
      {/* swap with: <Image src={`/images/partners/${slug}.png`} alt={name} width={120} height={40} className="object-contain max-h-10" /> */}
      <span className="text-sm font-bold text-dark text-center leading-tight">{short}</span>
    </div>
  );
}

export function PartnersSection() {
  return (
    <section className="relative py-16 md:py-20 bg-white overflow-hidden">
      {/* Decorative arc shapes */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <svg className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-[0.07]" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="240" stroke="#2CB4D7" strokeWidth="2" />
          <circle cx="250" cy="250" r="180" stroke="#2CB4D7" strokeWidth="2" />
          <circle cx="250" cy="250" r="120" stroke="#2CB4D7" strokeWidth="2" />
        </svg>
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] opacity-[0.07]" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="240" stroke="#2CB4D7" strokeWidth="2" />
          <circle cx="250" cy="250" r="180" stroke="#2CB4D7" strokeWidth="2" />
          <circle cx="250" cy="250" r="120" stroke="#2CB4D7" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="OUR PARTNERS"
          title="We work with the best in the business"
          description="Air, sea and ground partners around the globe so you always have options."
          align="center"
          className="mb-12"
        />

        {/* Row 1 — 4 logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {partnersRow1.map((p) => (
            <PartnerLogo key={p.name} name={p.name} short={p.short} />
          ))}
        </div>

        {/* Row 2 — 6 logos */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {partnersRow2.map((p) => (
            <PartnerLogo key={p.name} name={p.name} short={p.short} />
          ))}
        </div>
      </div>
    </section>
  );
}
