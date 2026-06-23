const stats = [
  { value: "9+", label: "Years of Experience" },
  { value: "600K+", label: "Packages delivered yearly" },
  { value: "24/7", label: "Customer Support" },
];

export function StatsSection() {
  return (
    <section className="relative bg-[#0a1820] py-16 md:py-20 overflow-hidden">
      {/* Globe/world map background image slot */}
      {/* <Image src="/images/globe-network.jpg" alt="" fill className="object-cover opacity-40" /> */}
      {/* Placeholder globe gradient */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse at 70% 50%, #0d4a6b 0%, #062030 40%, transparent 70%)",
        }}
      />
      {/* Simulated globe arc lines */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-80 h-80 opacity-20 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="160" r="155" stroke="#2CB4D7" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="120" stroke="#2CB4D7" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="80" stroke="#2CB4D7" strokeWidth="0.8" />
          <ellipse cx="160" cy="160" rx="155" ry="60" stroke="#2CB4D7" strokeWidth="0.8" />
          <ellipse cx="160" cy="160" rx="155" ry="110" stroke="#2CB4D7" strokeWidth="0.8" />
          <line x1="5" y1="160" x2="315" y2="160" stroke="#2CB4D7" strokeWidth="0.8" />
          <line x1="160" y1="5" x2="160" y2="315" stroke="#2CB4D7" strokeWidth="0.8" />
          {/* Route dots */}
          <circle cx="220" cy="120" r="3" fill="#2CB4D7" />
          <circle cx="100" cy="180" r="3" fill="#2CB4D7" />
          <circle cx="240" cy="200" r="3" fill="#2CB4D7" />
          <path d="M220 120 Q160 140 100 180" stroke="#2CB4D7" strokeWidth="1" strokeDasharray="4 3" />
          <path d="M100 180 Q170 190 240 200" stroke="#2CB4D7" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* Left text */}
          <div className="lg:max-w-md">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              One network,{" "}
              <span className="text-primary">220+ countries.</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed">
              From Dubai to Detroit, our routes span every major trade lane air, sea and ground backed by real-time visibility.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-row gap-10 lg:gap-14">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-1 leading-tight max-w-[90px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
