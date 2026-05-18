const industries = [
  {
    title: "Industrial & Manufacturing",
    description: "Just-in-time heavy transport for manufacturing logistics.",
    gradient: "from-[#1B2B3B] to-[#2CB4D7]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.8">
        <path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z"/>
        <rect x="9" y="15" width="6" height="6" fill="white" opacity="0.5"/>
      </svg>
    ),
  },
  {
    title: "Retail & E-Commerce",
    description: "Fast, scalable delivery for retail and online sales.",
    gradient: "from-[#0D3D5A] to-[#1a9bb8]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.8">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.44 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    ),
  },
  {
    title: "Food & Beverage",
    description: "Temperature-controlled transport from farm to market.",
    gradient: "from-[#1a5c3a] to-[#2CB4D7]",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.8">
        <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-3.5-8.58-5-8.58-5s-8.58 1.5-8.58 5v3h17.16v-3z"/>
      </svg>
    ),
  },
];

export function IndustriesSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.title}
              className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${industry.gradient} flex flex-col justify-end p-6 cursor-pointer group`}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1">{industry.title}</h3>
                <p className="text-sm text-white/75 leading-snug">{industry.description}</p>
              </div>

              {/* Top-right icon */}
              <div className="absolute top-5 right-5 opacity-50 group-hover:opacity-70 transition-opacity">
                {industry.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
