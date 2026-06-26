import Image from "next/image";

const INDUSTRY_IMAGE = "/images/industry.png";

const industries = [
  {
    title: "Industrial & Manufacturing",
    description: "Just-in-time heavy transport for manufacturing logistics.",
    icon: (
      // Shopping bag / package with handle
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V6a3 3 0 016 0v2" />
      </svg>
    ),
  },
  {
    title: "Retail & E-Commerce",
    description: "Fast, scalable delivery for retail and online sales.",
    icon: (
      // Storefront with awning
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9l1.5-4h15L21 9" />
        <path d="M4 9h16v11H4z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    title: "Food & Beverage",
    description: "Temperature-controlled transport from farm to market.",
    icon: (
      // Cloche / serving dome
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 17h18" />
        <path d="M4 17a8 8 0 0116 0" />
        <path d="M12 6v3" />
        <circle cx="12" cy="5" r="1" />
      </svg>
    ),
  },
];

export function IndustriesSection() {
  return (
    <section className="bg-white pb-20 lg:pb-24">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {industries.map((industry) => (
            <article
              key={industry.title}
              className="relative rounded-[var(--radius-xl)] overflow-hidden aspect-[4/5] cursor-pointer group"
            >
              {/* Background photo */}
              <Image
                src={INDUSTRY_IMAGE}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              {/* Dark gradient overlay for legibility */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#09242B]/85 via-[#09242B]/30 to-transparent"
              />

              {/* Bottom content — icon, then title, then description */}
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <div className="text-white mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
                  {industry.icon}
                </div>
                <h3 className="text-[1.125rem] lg:text-[1.25rem] font-extrabold text-white leading-tight">
                  {industry.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/85 leading-relaxed min-h-[2lh] line-clamp-2">
                  {industry.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
