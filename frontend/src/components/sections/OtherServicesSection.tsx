import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

const services = [
  {
    title: "Domestic",
    description:
      "Door-to-door consignments within 3–5 working days, with COD support for ecommerce in major cities.",
    image: "/images/container-truck.png",
    imageAlt: "Container truck on highway at sunset",
    href: "/services#domestic",
    icon: <TruckIcon />,
    buttonStyle: "primary" as const,
  },
  {
    title: "Local",
    description:
      "Instant local delivery for corporates, individuals and ecommerce companies.",
    image: "/images/bike-delivery.png",
    imageAlt: "Motorcycle courier carrying parcels through a city",
    href: "/services#local",
    icon: <MotorbikeIcon />,
    buttonStyle: "white" as const,
  },
];

export function OtherServicesSection() {
  return (
    <section className="bg-[#EAF4F7] py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="Other Services"
          title="Pick other service that fits your route"
          description="Whether it's a parcel across the planet or a package across town we've built a network for it."
          align="center"
          className="mb-12 lg:mb-14 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-[1080px] mx-auto">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative block aspect-[16/11] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-lg)] transition-shadow"
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                sizes="(min-width: 768px) 540px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(9,36,43,0) 35%, rgba(9,36,43,0.55) 70%, rgba(9,36,43,0.85) 100%)",
                }}
              />

              {/* Corner arrow */}
              <span
                aria-hidden="true"
                className={`absolute top-4 right-4 h-10 w-10 rounded-full inline-flex items-center justify-center transition-colors ${
                  s.buttonStyle === "primary"
                    ? "bg-[var(--color-ink)] text-[var(--color-accent)] group-hover:bg-[var(--color-ink-mid)]"
                    : "bg-white text-[var(--color-text)] group-hover:bg-white/90"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <div className="text-white mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
                  {s.icon}
                </div>
                <h3 className="text-[1.125rem] lg:text-[1.25rem] font-extrabold text-white leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/85 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TruckIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7.5" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
      <path d="M16 7l3 1M17 5l2 0.7" />
    </svg>
  );
}

function MotorbikeIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5.5" cy="16" r="3.2" />
      <circle cx="18.5" cy="16" r="3.2" />
      <path d="M5.5 16l3.5-7h4l2 4" />
      <path d="M13 9h3l2.5 7" />
      <path d="M9 5h2l1 2" />
    </svg>
  );
}
