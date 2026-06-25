import Image from "next/image";

const stats = [
  { value: "9+", label: "Years of Experience" },
  { value: "600K+", label: "Packages delivered yearly" },
  { value: "24/7", label: "Customer Support" },
];

export function AboutIntroSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left — ship photo with anniversary badge overlay */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden">
              <Image
                src="/images/cargo-with-plane-shadow.png"
                alt="Cargo ship with airplane shadow on the sea"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white shadow-[var(--shadow-card)] flex items-center justify-center p-3">
              <Image
                src="/9th-anniversary-badge.png"
                alt="9th year anniversary badge"
                width={160}
                height={160}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right — copy + stats */}
          <div>
            <div className="space-y-5 text-[15px] leading-relaxed text-[#3D5560]">
              <p>
                Nepex Cargo, a trade and logistic solution dedicated for
                e-commerce industry, is established to cater to the dynamic
                needs of electronic commerce industry which is growing by leaps
                and bounds. Nepex Cargo is poised to take the challenges and
                allow its clients to focus on their core activity. We have been
                serving numbers of startups and well-established companies
                globally.
              </p>
              <p>
                We at Nepex Cargo are committed to working for our customers
                with passion, respect, openness and integrity to meet the
                ever-changing demands of our customers with respect to logistics
                and fulfilment.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 lg:gap-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[2rem] lg:text-[2.25rem] font-extrabold text-[var(--color-accent)] leading-none tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[13px] text-[#56707A] leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
