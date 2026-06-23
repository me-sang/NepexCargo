import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Partner names from spec. Logos are placeholder wordmarks until real assets land.
 * Card style: white bg, subtle border, no shadow (per spec).
 */
const partnersRow1 = [
  { name: "LOGISTICS Transportation", accent: "#1B7E96" },
  { name: "ALPHALEAD EXPRESS", accent: "#1B7E96" },
  { name: "HEGELMANN", accent: "#2390AC" },
  { name: "MTL Multimodal", accent: "#1B7E96" },
];

const partnersRow2 = [
  { name: "LOGLINE", accent: "#ED6C30" },
  { name: "ace logistics", accent: "#2CB4D7" },
  { name: "ALIOTH SPEDYCJA", accent: "#2390AC" },
  { name: "KJTT", accent: "#2390AC" },
  { name: "FlyOx Shipping", accent: "#09242B" },
  { name: "XCEL LOGISOLUTIONS", accent: "#1B7E96" },
];

function PartnerCard({ name, accent }: { name: string; accent: string }) {
  return (
    <div className="flex items-center justify-center px-5 py-4 bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] min-h-[64px]">
      <span
        className="text-[13px] sm:text-sm font-extrabold tracking-tight text-center leading-tight"
        style={{ color: accent }}
      >
        {name}
      </span>
    </div>
  );
}

export function PartnersSection() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container-content">
        <SectionHeader
          eyebrow="Our Partners"
          title="We work with the best in the business"
          description="Air, sea and ground partners around the globe so you always have options."
          align="center"
          className="mb-12 mx-auto"
        />

        {/* Row 1 — 4 larger partners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-3 lg:mb-4">
          {partnersRow1.map((p) => (
            <PartnerCard key={p.name} {...p} />
          ))}
        </div>

        {/* Row 2 — 6 smaller partners */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {partnersRow2.map((p) => (
            <PartnerCard key={p.name} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
