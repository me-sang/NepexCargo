import Image from "next/image";

export function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background photo */}
      <Image
        src="/images/about-hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,36,43,0.55) 0%, rgba(9,36,43,0.65) 100%)",
        }}
      />

      <div className="container-content py-20 lg:py-24">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase bg-[var(--color-accent)] text-white">
            About
          </span>
          <h1 className="mt-5 text-[2.25rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold text-white leading-[1.1] tracking-tight">
            Get to know about us
          </h1>
          <p className="mt-4 text-[15px] md:text-base text-white/85 leading-relaxed max-w-xl">
            Years of expertise in serving the dynamic need of on-demand cargo
            and courier service.
          </p>
        </div>
      </div>
    </section>
  );
}
