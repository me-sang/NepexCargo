import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

const PARTNER_LOGO = "/images/dummy-logo.png";

const partnersRow1 = [
  "Logistics Transportation",
  "Alphalead Express",
  "Hegelmann",
  "MTL Multimodal",
];

const partnersRow2 = [
  "Logline",
  "Ace Logistics",
  "Alioth Spedycja",
  "KJTT",
  "FlyEx Shipping",
  "Xcel Logisolutions",
];

function PartnerCard({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] h-[78px] lg:h-[88px] px-5">
      <div className="relative w-full h-[42px] lg:h-[52px]">
        <Image
          src={PARTNER_LOGO}
          alt={name}
          fill
          sizes="160px"
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function PartnersSection() {
  return (
    <section className="relative bg-white py-20 lg:py-24 overflow-hidden">
      {/* Decorative ring — top-left corner */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/Ellipse%203.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-[260px] -left-[200px] w-[540px] h-auto select-none"
      />
      {/* Decorative ring — top-right corner (mirrored) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/Ellipse%203.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-[260px] -right-[200px] w-[540px] h-auto select-none scale-x-[-1]"
      />

      <div className="relative z-10 container-content">
        <SectionHeader
          eyebrow="Our Partners"
          title="We work with the best in the business"
          description="Air, sea and ground partners around the globe so you always have options."
          align="center"
          className="mb-12 mx-auto"
        />

        {/* Row 1 — 4 wider cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 mb-4 lg:mb-5 max-w-[920px] mx-auto">
          {partnersRow1.map((name) => (
            <PartnerCard key={name} name={name} />
          ))}
        </div>

        {/* Row 2 — 6 smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {partnersRow2.map((name) => (
            <PartnerCard key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}
