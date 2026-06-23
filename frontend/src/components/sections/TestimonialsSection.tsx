"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "John Doe",
    role: "Operations Manager",
    rating: 5,
    avatarSrc: "/images/testimonial-john.jpg",
    avatarPlaceholder: "#2CB4D7",
    initials: "JD",
  },
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "Amelia K. Hamilton",
    role: "Supply Chain Director",
    rating: 5,
    avatarSrc: "/images/testimonial-amelia1.jpg",
    avatarPlaceholder: "#e05c7a",
    initials: "AH",
  },
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "Amelia K. Hamilton",
    role: "E-Commerce Founder",
    rating: 5,
    avatarSrc: "/images/testimonial-amelia2.jpg",
    avatarPlaceholder: "#7c5c8a",
    initials: "AK",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? "#F59E0B" : "#E5E7EB"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [activeDot, setActiveDot] = useState(1);

  return (
    <section className="py-20 md:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="TESTIMONIALS"
          title="Happy users feedback"
          description="Real words from shippers, store owners and operations teams who move with Nepex Cargo."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border/60 flex flex-col"
            >
              {/* Large quote mark */}
              <div className="text-primary mb-4">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="currentColor">
                  <path d="M0 22V13.2C0 9.68 0.88 6.8 2.64 4.4C4.48 2.04 7.12 0.56 10.56 0L12.32 3.08C10.32 3.52 8.72 4.4 7.52 5.72C6.4 7.04 5.76 8.68 5.6 10.56H11V22H0ZM17 22V13.2C17 9.68 17.88 6.8 19.64 4.4C21.48 2.04 24.12 0.56 27.56 0L29.32 3.08C27.32 3.52 25.72 4.4 24.52 5.72C23.4 7.04 22.76 8.68 22.6 10.56H28V22H17Z" />
                </svg>
              </div>

              {/* Quote text */}
              <p className="text-sm text-text-muted leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-dark">{t.name}</div>
                  <StarRating count={t.rating} />
                </div>
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                  style={{ backgroundColor: t.avatarPlaceholder }}
                >
                  {/* swap with: <Image src={t.avatarSrc} alt={t.name} width={44} height={44} className="object-cover w-full h-full" /> */}
                  {t.initials}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide dots */}
        <div className="flex items-center justify-center gap-2.5 mt-10">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setActiveDot(i)}
              className={`rounded-full transition-all duration-300 ${
                activeDot === i ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-text-muted/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
