export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA card with background image */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background — teal-dark gradient + airplane image slot */}
          <div className="absolute inset-0 bg-linear-to-b from-[#1a5570]/90 to-[#0a2530]/95" />
          {/* <Image src="/images/cta-airplane.jpg" alt="" fill className="object-cover mix-blend-overlay opacity-50" /> */}

          {/* Content */}
          <div className="relative z-10 text-center px-6 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Let&apos;s move your business forward
            </h2>
            <p className="text-base text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
              Fast, reliable, and customised logistics solutions at your fingertips. No commitments, no hidden fees.
            </p>
            <button className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-dark text-base font-semibold hover:bg-white/90 transition-colors shadow-md">
              Get a Free Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
