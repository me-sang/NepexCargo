const stats = [
  { value: "9+", label: "Years of Experience" },
  { value: "600K+", label: "Packages delivered yearly" },
  { value: "24/7", label: "Customer Support" },
];

export function StatsSection() {
  return (
    <section className="bg-[#0D1B2A] py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left text */}
          <div className="lg:max-w-lg">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              One network,{" "}
              <span className="text-[#2CB4D7]">220+</span> countries.
            </h2>
            <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed">
              From Dubai to Detroit, our routes span every major trade lane — air, sea and ground backed by real-time visibility.
            </p>
          </div>

          {/* Decorative globe lines */}
          <div className="hidden lg:block relative w-64 h-64 shrink-0">
            <div className="absolute inset-0 rounded-full border border-[#2CB4D7]/20" />
            <div className="absolute inset-4 rounded-full border border-[#2CB4D7]/15" />
            <div className="absolute inset-8 rounded-full border border-[#2CB4D7]/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#2CB4D7]/20 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
            </div>
            {/* Animated dots */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute w-2 h-2 rounded-full bg-[#2CB4D7]"
                style={{
                  top: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 44 * Math.cos((deg * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-row lg:flex-col gap-8 lg:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center lg:text-right">
                <div className="text-3xl md:text-4xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-1 leading-tight max-w-[100px] lg:max-w-none ml-auto">
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
