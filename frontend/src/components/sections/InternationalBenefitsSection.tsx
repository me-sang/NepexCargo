import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    title: "Save on Shipping",
    description: "Save time and money on shipping packages",
    icon: "/images/ship-internationally/streamline-cyber-color_money-bag-1.svg",
  },
  {
    title: "Lower Courier Rates",
    description: "Discounted rates with premium couriers",
    icon: "/images/ship-internationally/tdesign_discount-list.svg",
  },
  {
    title: "Instant Shipping Quotes",
    description: "Instant shipping quotes. No registration needed",
    icon: "/images/ship-internationally/streamline-ultimate-color_receipt-dollar.svg",
  },
  {
    title: "Fast Delivery Options",
    description: "Choose express and same-day delivery services",
    icon: "/images/ship-internationally/streamline-cyber-color_delivery-package-2.svg",
  },
  {
    title: "Real-Time Tracking",
    description: "Track your packages live from pickup to delivery",
    icon: "/images/ship-internationally/streamline-sharp-color_transfer-truck-time.svg",
  },
  {
    title: "No Signup Required",
    description: "Get shipping estimates instantly without registration",
    icon: "/images/ship-internationally/glyphs_mobile-duo.svg",
  },
];

export function InternationalBenefitsSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-content">
        <SectionHeader
          eyebrow="Fast & Reliable"
          title="Why Ship Internationally with Nepex Cargo?"
          description="Get the best deal from leading courier companies."
          align="center"
          className="mb-14 lg:mb-16 mx-auto"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-10 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="text-center flex flex-col items-center">
              <div className="relative h-12 w-12 mb-5">
                <Image
                  src={f.icon}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <h3 className="text-[18px] font-bold text-[var(--color-text)] mb-2">
                {f.title}
              </h3>
              <p className="text-[14px] text-[#56707A] leading-relaxed max-w-[260px]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
