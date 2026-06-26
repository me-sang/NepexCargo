import Image from "next/image";

export function ContactHeroSection() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/container-truck.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,36,43,0.55) 0%, rgba(9,36,43,0.7) 100%)",
        }}
      />

      <div className="container-content py-20 lg:py-24">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase bg-[var(--color-accent)] text-white">
            Contact
          </span>
          <h1 className="mt-5 text-[2.25rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold text-white leading-[1.1] tracking-tight">
            Let&apos;s get your shipment moving
          </h1>
          <p className="mt-4 text-[15px] md:text-base text-white/85 leading-relaxed max-w-xl">
            Tell us about your needs and our team will get back within 1
            business hour.
          </p>
        </div>
      </div>
    </section>
  );
}
