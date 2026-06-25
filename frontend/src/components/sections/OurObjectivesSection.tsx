import { SectionHeader } from "@/components/ui/SectionHeader";

const objectives = [
  {
    number: "01",
    title: "Preferable",
    description:
      "Be the most preferred logistic solution provider for all shipping requirement.",
  },
  {
    number: "02",
    title: "Assistive",
    description: "Assist businesses to focus on their core business activities.",
  },
  {
    number: "03",
    title: "Delightful",
    description:
      "Delight customers with quality service by setting new trends through innovation and technology.",
  },
];

export function OurObjectivesSection() {
  return (
    <section className="bg-[var(--color-surface)] py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="Our Principles"
          title="Our Objectives we follow in our journey"
          description="Three guiding principles that shape every shipment, every partnership, every decision we make."
          align="center"
          className="mb-14 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {objectives.map((obj) => (
            <article
              key={obj.number}
              className="rounded-[var(--radius-lg)] p-7 lg:p-8 bg-[var(--color-brand)]"
            >
              <div className="text-[2.5rem] lg:text-[2.75rem] font-extrabold leading-none text-white/75 tracking-tight">
                {obj.number}
              </div>
              <h3 className="mt-6 text-[18px] lg:text-[19px] font-bold text-white">
                {obj.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-white/75">
                {obj.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
