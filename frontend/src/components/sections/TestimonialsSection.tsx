"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Six testimonials. Names + locations carried over from the Nepex Travels dataset
 * the user supplied; the quotes are rewritten for cargo/logistics context.
 */
type Testimonial = {
  name: string;
  context: string;
  image: string;
  stars: number;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Nana Nuad",
    context: "Bangkok • International Shipping",
    image: "/images/testimonials/nana.png",
    stars: 5,
    quote:
      "I've shipped multiple consignments through Nepex Cargo, and the service was excellent. They're fast, reliable, and know exactly what they're doing.",
  },
  {
    name: "Arbin Regmi",
    context: "Kathmandu • Bulk Cargo to Dubai",
    image: "/images/testimonials/arbin.webp",
    stars: 5,
    quote:
      "Nepex Cargo made my bulk shipment effortless. They handled all the customs paperwork, guided me at every step, and my goods arrived without any hassle. Highly recommend their service!",
  },
  {
    name: "Sishir Yogi",
    context: "Dubai • Express Air Freight",
    image: "/images/testimonials/sishir.webp",
    stars: 5,
    quote:
      "I needed a last-minute air freight from Dubai and Nepex delivered on time without any stress. Their team is responsive, well-organized, and truly knows the logistics process inside out.",
  },
  {
    name: "Mahendra Magar",
    context: "Kathmandu • First-time Shipper",
    image: "/images/testimonials/mahendra.webp",
    stars: 5,
    quote:
      "Huge thanks to Nepex Cargo for making my first international shipment so easy and smooth. They handled the documentation and tracking quickly and professionally.",
  },
  {
    name: "Manjil Khadka",
    context: "Kathmandu • Regular Shipper, Europe",
    image: "/images/testimonials/manjil.png",
    stars: 5,
    quote:
      "The best logistics service I have ever used. From quote to delivery, everything was smooth, professional, and hassle-free. Will definitely use them again for my future shipments.",
  },
  {
    name: "Kumar Regmi",
    context: "Thailand • Cross-border Cargo",
    image: "/images/testimonials/kumar.png",
    stars: 5,
    quote:
      "I was worried about the customs paperwork for my Thailand-to-Nepal shipment, but Nepex handled everything smoothly. Their team is friendly, helpful, and really fast. Will use them again for sure!",
  },
];

const CARDS_PER_PAGE = 3;
const totalPages = testimonials.length - CARDS_PER_PAGE + 1; // 4 pages from 6 items

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? "var(--color-warm)" : "#E5E5E5"}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="bg-white rounded-[16px] p-7 lg:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-lg)] transition-shadow h-full flex flex-col">
      {/* Quote glyph */}
      <svg
        width="34"
        height="28"
        viewBox="0 0 34 28"
        fill="var(--color-accent)"
        aria-hidden="true"
        className="mb-5"
      >
        <path d="M0 28V18.5C0 10.5 4.5 3.5 11.5 0L14 4.5c-4 2-7 5.5-7 9.5h7V28H0zm20 0V18.5C20 10.5 24.5 3.5 31.5 0L34 4.5c-4 2-7 5.5-7 9.5h7V28H20z" />
      </svg>

      {/* Quote text */}
      <p className="text-[14.5px] text-[#3D5560] leading-relaxed flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Footer: name + stars on left, avatar on right */}
      <div className="mt-6 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-[var(--color-text)] truncate">
            {t.name}
          </div>
          <div className="mt-2">
            <StarRating count={t.stars} />
          </div>
        </div>
        <div className="relative w-11 h-11 rounded-[8px] overflow-hidden shrink-0 bg-[var(--color-border)]">
          <Image
            src={t.image}
            alt={t.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const [activePage, setActivePage] = useState(0);
  const visible = testimonials.slice(activePage, activePage + CARDS_PER_PAGE);

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-surface)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Testimonials"
          title="Happy users feedback"
          description="Real words from shippers, store owners and operations teams who move with Nepex Cargo."
          align="center"
          className="mb-12 mx-auto"
        />

        {/* Desktop: sliding 3-card window */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {visible.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-5">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>

        {/* Pagination dots — desktop only */}
        <div
          className="hidden md:flex items-center justify-center gap-2 mt-10"
          role="tablist"
          aria-label="Testimonial pages"
        >
          {Array.from({ length: totalPages }).map((_, i) => {
            const isActive = i === activePage;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Page ${i + 1}`}
                onClick={() => setActivePage(i)}
                className={`transition-all rounded-full ${
                  isActive
                    ? "w-7 h-2 bg-[var(--color-accent)]"
                    : "w-2 h-2 bg-[#C3D2D7] hover:bg-[#A4BCC4]"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
