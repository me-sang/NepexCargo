import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Vad = {
  title: string;
  description: string;
  icon: string;
};

const items: Vad[] = [
  {
    title: "TSD - Time Specific Delivery",
    description:
      "The unique service where Nepex Cargo delivers the shipment to the location in a particular time specified by the clients.",
    icon: "Frame.svg",
  },
  {
    title: "Dropship Service",
    description:
      "The service where Nepex Cargo will pick up the shipment on behalf of the shipper from various vendors for delivering to its consignees.",
    icon: "Frame-1.svg",
  },
  {
    title: "SDL - Special Delivery Location",
    description:
      "The unique service where Nepex Cargo delivers the shipment to the location in a particular time specified by the clients.",
    icon: "Frame-2.svg",
  },
  {
    title: "FPD - Fragile Parcel Delivery",
    description:
      "The special service where Nepex Cargo delivers shipments of fragile and sensitive parcels such as cakes, flower baskets and other parcels which need intensive care while handling.",
    icon: "Frame-3.svg",
  },
  {
    title: "SOD - Special Occasion Delivery",
    description:
      "The special service where Nepex Cargo delivers the parcel on special events and occasions such as Father's Day, Mother's Day, Valentine's Day, New Year, festivals etc. Note: Value Added Services are subject to cutoffs — ask Nepex Cargo for availability.",
    icon: "Frame-4.svg",
  },
  {
    title: "Import / Export",
    description:
      "Nepex Cargo & Courier helps in Import & Export of products to and from your home country to worldwide via Air Cargo and Ship Cargo. It also helps in custom clearance.",
    icon: "Vector.svg",
  },
];

export function VadServicesSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="VAD"
          title="VAD - Value Added Services"
          description="Working more than 9 years providing Instant Home Delivery Service globally, we have always focused on improvising our services."
          align="center"
          className="mb-14 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 lg:gap-y-14">
          {items.map((item) => (
            <div key={item.title}>
              <div className="relative w-12 h-12">
                <Image
                  src={`/images/vad svg/${item.icon}`}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <h3 className="mt-5 text-[17px] lg:text-[18px] font-bold text-[var(--color-text)] leading-snug">
                {item.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#56707A]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
