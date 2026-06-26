import Image from "next/image";

type Office = {
  country: string;
  countryCode: string;
  address: string;
  call: string;
  whatsapp: string;
  email: string;
  helpline: string;
  isHeadOffice?: boolean;
};

const offices: Office[] = [
  {
    country: "Nepal",
    countryCode: "np",
    address: "Daphe Marga, Babarmahal Kathmandu 44600, Nepal.",
    call: "01 479 3933 | 01 479 3934",
    whatsapp: "+971-50-554-7432",
    email: "info@nepexcargo.com",
    helpline: "01 479 3933 | 01 479 3934",
    isHeadOffice: true,
  },
  {
    country: "Thailand",
    countryCode: "th",
    address: "23 Ngamwongwan Yaek 19, Nonthaburi 11000, Thailand",
    call: "098 080 9265 | 094 452 4649",
    whatsapp: "098 080 9265 | 094 452 4649",
    email: "info@nepexcargo.com",
    helpline: "01 479 3933 | 01 479 3934",
  },
  {
    country: "United Arab Emirates (UAE)",
    countryCode: "ae",
    address: "Burjuman Business Tower Office No. 949, Burjuman Dubai, UAE",
    call: "01 479 3933 | 01 479 3934",
    whatsapp: "+971-50-554-7432",
    email: "info@nepexcargo.com",
    helpline: "01 479 3933 | 01 479 3934",
  },
  {
    country: "India",
    countryCode: "in",
    address: "L-109 Ground Floor, Street No. 7-D Mahipalpur, Delhi 110037, India.",
    call: "01 479 3933 | 01 479 3934",
    whatsapp: "+971-50-554-7432",
    email: "info@nepexcargo.com",
    helpline: "01 479 3933 | 01 479 3934",
  },
];

function OfficeRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13.5px] leading-relaxed">
      <span className="text-[var(--color-accent)] font-semibold">{label}:</span>{" "}
      <span className="text-[#3D5560]">{value}</span>
    </p>
  );
}

function OfficeCard({ office }: { office: Office }) {
  return (
    <article className="relative bg-white rounded-[var(--radius-lg)] p-6 lg:p-7 shadow-[var(--shadow-card)]">
      {office.isHeadOffice && (
        <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase bg-[var(--color-accent)] text-white">
          Head Office
        </span>
      )}
      <span
        className={`fi fi-${office.countryCode} mb-3 rounded-[3px]`}
        style={{ width: "36px", height: "26px", display: "block" }}
        aria-hidden="true"
      />
      <span className="sr-only">{office.country} flag</span>
      <h3 className="text-[18px] font-bold text-[var(--color-text)]">
        {office.country}
      </h3>
      <p className="mt-1.5 text-[13.5px] text-[#56707A] leading-relaxed">
        {office.address}
      </p>
      <div className="mt-4 space-y-2">
        <OfficeRow label="Call" value={office.call} />
        <OfficeRow label="Whatsapp" value={office.whatsapp} />
        <OfficeRow label="Email" value={office.email} />
        <OfficeRow label="Helpline" value={office.helpline} />
      </div>
    </article>
  );
}

export function ContactInfoSection() {
  return (
    <section className="relative bg-[var(--color-surface)] py-20 lg:py-24 overflow-hidden">
      {/* Dotted world map background */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 bg-no-repeat bg-center bg-cover opacity-90"
        style={{ backgroundImage: "url('/images/card-bg.png')" }}
      />

      <div className="relative z-10 container-content">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 lg:gap-7">
          {/* Left tall card — office hours over cargo ship image */}
          <div className="relative rounded-[var(--radius-lg)] overflow-hidden min-h-[460px] lg:min-h-0">
            <Image
              src="/images/cargo-with-plane-shadow.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 380px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(9,36,43,0.15) 0%, rgba(9,36,43,0.45) 65%, rgba(9,36,43,0.75) 100%)",
              }}
            />
            <div className="relative h-full flex flex-col justify-end p-6 lg:p-7 text-white">
              <h3 className="text-[18px] font-bold text-white">Office hours (local)</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/90">
                Sunday – Friday : 9:30 am – 6:00 pm
                <br />
                Our services will close only on prior notice!
              </p>
            </div>
          </div>

          {/* Right — 2×2 office cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
            {offices.map((o) => (
              <OfficeCard key={o.country} office={o} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
