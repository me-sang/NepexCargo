import { SectionHeader } from "@/components/ui/SectionHeader";

const partners = [
  { name: "LUG.ME", style: "text-[#1B2B3B]" },
  { name: "ace logistics", style: "text-[#E87722]" },
  { name: "ALIOTH", style: "text-[#1B2B3B]" },
  { name: "KITT", style: "text-[#2CB4D7]" },
  { name: "RTL", style: "text-[#CC0000]" },
  { name: "ADEL", style: "text-[#1B2B3B]" },
];

export function PartnersSection() {
  return (
    <section className="py-16 md:py-20 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="OUR PARTNERS"
          title="We work with the best in the business"
          description="Air, sea and ground partners around the globe so you always have options."
          align="center"
          className="mb-12"
        />

        {/* Partner logos */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center px-6 py-3 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow min-w-[120px]"
            >
              <span className={`text-base md:text-lg font-extrabold tracking-wide ${partner.style}`}>
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
