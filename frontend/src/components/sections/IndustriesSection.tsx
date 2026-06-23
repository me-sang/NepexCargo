const industries = [
  {
    title: "Industrial & Manufacturing",
    description: "Just-in-time heavy transport for manufacturing logistics.",
    imageSrc: "/images/industry-manufacturing.jpg",
    placeholder: "linear-gradient(160deg, #1a3040 0%, #2a6080 100%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <rect x="2" y="7" width="3" height="14" />
        <rect x="9" y="7" width="3" height="14" />
        <rect x="16" y="7" width="3" height="14" />
        <path d="M2 7l5-5 5 5 5-5 5 5" />
        <rect x="0" y="21" width="24" height="2" />
      </svg>
    ),
  },
  {
    title: "Retail & E-Commerce",
    description: "Fast, scalable delivery for retail and online sales.",
    imageSrc: "/images/industry-retail.jpg",
    placeholder: "linear-gradient(160deg, #1a4060 0%, #2cb4d7 100%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    title: "Food & Beverage",
    description: "Temperature-controlled transport from farm to market.",
    imageSrc: "/images/industry-food.jpg",
    placeholder: "linear-gradient(160deg, #1a3840 0%, #1a6070 100%)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
];

export function IndustriesSection() {
  return (
    <section className="py-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {industries.map((industry) => (
            <div
              key={industry.title}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ minHeight: "360px" }}
            >
              {/* Background image / placeholder */}
              <div
                className="absolute inset-0"
                style={{ background: industry.placeholder }}
              />
              {/* <Image src={industry.imageSrc} alt={industry.title} fill className="object-cover" /> */}

              {/* Dark gradient overlay — stronger at bottom for text */}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-transparent group-hover:from-black/85 transition-all duration-300" />

              {/* Content at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                {/* Icon */}
                <div className="mb-3">{industry.icon}</div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{industry.title}</h3>
                <p className="text-xs text-white/75 leading-relaxed">{industry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
