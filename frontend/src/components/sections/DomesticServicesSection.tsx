import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Row = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
};

const rows: Row[] = [
  {
    title: "Local Delivery Service",
    description:
      "The service where Nepex Cargo serves instantly within the same city/territory usually takes 24 hrs or even less depending upon the available resource and the urgency.",
    image: "/images/bike-delivery.png",
    imageAlt: "Bike courier delivering parcels in the city",
    imagePosition: "left",
  },
  {
    title: "Domestic Delivery Service",
    description:
      "The delivery service within country globally. Nepex Cargo collects the value of the product upon delivery from the consignee and remits the same to the shipper all over the nation for the following cities. Nepex Cargo provides delivery service to all of cities. The domestic delivery service usually takes 3–5 working days (max) to reach the recipient. In most cases, Nepex Cargo provides home delivery service to the customer. But in rare cases or beyond 5 km range from city, the recipient might have to reach the Nepex Cargo office to collect the parcel.",
    image: "/images/container-truck.png",
    imageAlt: "Container truck on a highway at sunset",
    imagePosition: "right",
  },
];

function QuoteButton() {
  return (
    <a
      href="/contact"
      className="inline-flex items-center justify-center h-11 px-7 rounded-full text-[14px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      Get a Quote
    </a>
  );
}

export function DomesticServicesSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="Domestic Services"
          title="Standard Delivery Services"
          description="Working more than 9 years providing Instant Home Delivery Service globally, we have always focused on improvising our services."
          align="center"
          className="mb-14 mx-auto"
        />

        <div className="space-y-16 lg:space-y-20">
          {rows.map((row) => (
            <div
              key={row.title}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center"
            >
              {/* Image */}
              <div
                className={`relative aspect-[5/4] rounded-[var(--radius-xl)] overflow-hidden ${
                  row.imagePosition === "right" ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={row.image}
                  alt={row.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 540px, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Copy */}
              <div className={row.imagePosition === "right" ? "lg:order-1" : ""}>
                <h3 className="text-[1.5rem] lg:text-[1.75rem] font-extrabold text-[var(--color-text)] leading-tight">
                  {row.title}
                </h3>
                <p className="mt-5 text-[15px] leading-relaxed text-[#3D5560]">
                  {row.description}
                </p>
                <div className="mt-7">
                  <QuoteButton />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
