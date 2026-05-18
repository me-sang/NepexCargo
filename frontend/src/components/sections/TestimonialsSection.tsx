import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "John Doe",
    role: "Operations Manager",
    rating: 5,
    initials: "JD",
    color: "#2CB4D7",
  },
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "Amelia K. Hamilton",
    role: "Supply Chain Director",
    rating: 5,
    initials: "AH",
    color: "#1B2B3B",
  },
  {
    quote: "What I love most is the real-time visibility. I always know where my cargo is, no surprises.",
    name: "Amelia K. Hamilton",
    role: "E-Commerce Founder",
    rating: 5,
    initials: "AK",
    color: "#0D3D5A",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? "#2CB4D7" : "#E5E7EB"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F5F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="TESTIMONIALS"
          title="Happy users feedback"
          description="Real words from shippers, store owners and operations teams who move with Nepex Cargo."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB]"
            >
              {/* Quote mark */}
              <div className="text-5xl font-serif text-[#2CB4D7] leading-none mb-4 select-none">&ldquo;</div>

              <p className="text-sm text-[#6B7280] leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1B2B3B]">{testimonial.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{testimonial.role}</div>
                </div>
                <div className="ml-auto">
                  <StarRating count={testimonial.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
