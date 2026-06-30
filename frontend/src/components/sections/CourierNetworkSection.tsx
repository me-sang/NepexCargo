import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

const COURIER_LOGO = "/images/dummy-logo.png";
const couriers = ["EMS", "UPS", "FedEx", "USPS", "ParcelLab", "DHL"];

export function CourierNetworkSection() {
  return (
    <section className="relative bg-white py-20 lg:py-24 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/testimonails-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-30 select-none"
      />

      <div className="relative z-10 container-content">
        <SectionHeader
          eyebrow="Courier Network"
          title="Compare shipping rates from top couriers"
          description="Find the best price and delivery service in seconds."
          align="center"
          className="mb-14 lg:mb-16 mx-auto"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5 max-w-[1120px] mx-auto">
          {[...couriers, ...couriers].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center justify-center bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] h-[78px] lg:h-[92px] px-5 shadow-[0_1px_2px_rgba(9,36,43,0.04)]"
            >
              <div className="relative w-full h-[42px] lg:h-[52px]">
                <Image
                  src={COURIER_LOGO}
                  alt={name}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
