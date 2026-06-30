import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    number: "01",
    title: "Get a Quote",
    description: "Instant pricing based on size, weight, and destination.",
  },
  {
    number: "02",
    title: "Pack & Label",
    description: "Download your shipping labels and customs documentation instantly.",
  },
  {
    number: "03",
    title: "Pick-up",
    description: "Schedule a courier collection or drop off at one of 50,000+ locations.",
  },
  {
    number: "04",
    title: "Track & Deliver",
    description: "Monitor your shipment with end-to-end updates until delivery.",
  },
];

export function QuoteJourneySection() {
  return (
    <section className="relative bg-[var(--color-brand)] pt-20 lg:pt-24 pb-24 lg:pb-28 overflow-hidden">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <SectionHeader
            eyebrow="How it works"
            title="From quote to doorstep in four steps"
            description="A simple, transparent flow built for individuals and businesses."
            align="left"
            light
          />

          <div className="hidden lg:block relative w-full max-w-[480px] ml-auto">
            <div
              aria-hidden="true"
              className="absolute -bottom-2 left-[8%] right-[8%] h-5 rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 65%)",
              }}
            />
            <div className="relative aspect-[16/9]">
              <Image
                src="/images/how-it-works.png"
                alt="Nepex Cargo delivery truck"
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <ol className="relative mt-10 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <li key={step.number} className="relative flex flex-col items-start">
                {/* Connector tail starts at this chip's center.
                    Non-last steps: extend into the gap, ending at the next chip's center.
                    chip center = 28px from cell left (chip is 56×56 at left-of-cell).
                    next chip center = cellWidth + gap(32) + 28 → right offset = -(32+28) = -60px.
                    Last step: short stub past chip + arrow. */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:block pointer-events-none absolute top-[27px] left-[28px] right-[-60px] h-0 border-t-2 border-dashed border-white/45"
                  />
                )}

                <span
                  className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-[10px] bg-white shadow-[0_12px_28px_-10px_rgba(9,36,43,0.55)]"
                  aria-hidden="true"
                >
                  <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-[var(--color-accent)]">
                    {step.number}
                  </span>
                </span>
                <h3 className="mt-6 text-[17px] font-extrabold text-white tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/85 max-w-[240px]">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
