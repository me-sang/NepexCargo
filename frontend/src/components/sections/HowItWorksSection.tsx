import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    number: "01",
    title: "Enter route",
    description: "Tell us where it's coming from and going to.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Compare rates",
    description: "See live pricing across air, sea and road.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 20h18" />
        <path d="M6 20V12M11 20V8M16 20V14M21 20V6" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Book & label",
    description: "Pay securely, print labels or schedule pickup.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12l8.73-5.04M12 22V12" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Track & deliver",
    description: "Live updates from origin to destination.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative bg-[var(--color-brand)] py-20 lg:py-24 overflow-hidden">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 30%, #FFFFFF 0.5px, transparent 0.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative container-content">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          {/* Left — header + step cards */}
          <div>
            <SectionHeader
              eyebrow="How It Works"
              title="From quote to doorstep in four steps"
              description="A simple, transparent flow built for individuals and businesses."
              align="left"
              light
              className="mb-10"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-[var(--radius-lg)] p-5 bg-white/12 backdrop-blur-sm border border-white/15 hover:bg-white/[0.18] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[28px] font-extrabold leading-none"
                      style={{ color: "#6FE4FF" }}
                    >
                      {step.number}
                    </span>
                    <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-white/75 leading-relaxed">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Right — truck illustration placeholder */}
          <div className="hidden lg:block relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden bg-white/[0.06] border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <svg
                viewBox="0 0 320 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md"
                aria-hidden="true"
              >
                {/* Road */}
                <line x1="0" y1="170" x2="320" y2="170" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="8 8" />
                {/* Trailer */}
                <rect x="30" y="70" width="170" height="80" rx="6" fill="white" />
                <rect x="40" y="80" width="150" height="60" rx="3" fill="#F1F4F6" />
                <line x1="115" y1="80" x2="115" y2="140" stroke="#C3C3C3" strokeWidth="1.5" />
                {/* Cab */}
                <path d="M200 90 L260 90 L280 110 L280 150 L200 150 Z" fill="#2390AC" />
                <path d="M210 100 L255 100 L268 116 L268 130 L210 130 Z" fill="#6FE4FF" opacity="0.7" />
                {/* Wheels */}
                <circle cx="70" cy="155" r="14" fill="#09242B" />
                <circle cx="70" cy="155" r="6" fill="#2CB4D7" />
                <circle cx="155" cy="155" r="14" fill="#09242B" />
                <circle cx="155" cy="155" r="6" fill="#2CB4D7" />
                <circle cx="240" cy="155" r="14" fill="#09242B" />
                <circle cx="240" cy="155" r="6" fill="#2CB4D7" />
                {/* Speed lines */}
                <line x1="0" y1="55" x2="20" y2="55" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="65" x2="14" y2="65" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
