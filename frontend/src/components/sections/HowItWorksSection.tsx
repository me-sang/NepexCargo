import Image from "next/image";
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
        {/* Top: title left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 items-center mb-12 lg:mb-14">
          <SectionHeader
            eyebrow="How It Works"
            title="From quote to doorstep in four steps"
            description="A simple, transparent flow built for individuals and businesses."
            align="left"
            light
          />

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src="/images/how-it-works.png"
                alt="Cargo delivery"
                fill
                sizes="(min-width: 1024px) 580px, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Bottom: four step cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
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
    </section>
  );
}
