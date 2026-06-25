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
    title: "Express Air Courier",
    description:
      "Nepex Cargo provides Express Air Courier service all over the globe with time threshold 5–7 working days. Service charges are automatically calculated through the Nepex Cargo app or through the nearest Nepex Cargo offices.",
    image: "/images/aeroplane.png",
    imageAlt: "Commercial aeroplane flying above the clouds at sunset",
    imagePosition: "left",
  },
  {
    title: "International Export & Import",
    description:
      "Nepex Cargo provides International Export and Import service via air shipment to and from all around the world. Additionally, Nepex Cargo also provides custom-clearance service for commercial consignments. The major countries we serve with Export & Import facility are the United States of America, United Kingdom, Australia, Japan, South Korea, United Arab Emirates, China, India and Bangladesh.",
    image: "/images/cargo-with-plane-shadow.png",
    imageAlt: "Cargo container ship from above with airplane shadow",
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

export function InternationalServicesSection() {
  return (
    <section className="bg-[var(--color-accent-soft)] py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="International Services"
          title="International Delivery Services"
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
