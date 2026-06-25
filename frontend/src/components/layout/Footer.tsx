import Image from "next/image";
import { Logo } from "@/components/ui/Logo";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Franchise", href: "/franchise" },
      { label: "Articles", href: "/articles" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "International", href: "/services/international" },
      { label: "Domestic", href: "/services/domestic" },
      { label: "Local", href: "/services/local" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track a Shipment", href: "/track" },
      { label: "Get a Quote", href: "/quote" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

type SocialIcon = {
  label: string;
  href: string;
  render: () => React.ReactNode;
};

const socialLinks: SocialIcon[] = [
  {
    label: "Facebook",
    href: "#",
    render: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
        <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0022 12z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    render: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="105%" r="120%">
            <stop offset="0%" stopColor="#FED576" />
            <stop offset="25%" stopColor="#F47133" />
            <stop offset="55%" stopColor="#BC3081" />
            <stop offset="100%" stopColor="#4C63D2" />
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
        <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.9" r="1" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    render: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    render: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#4DCB5A" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative bg-[var(--color-brand)] text-white overflow-hidden">
      {/* Oversized decorative wordmark — signature footer moment */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-2 sm:-bottom-4 lg:-bottom-6 left-0 right-0 flex justify-center"
      >
        <span className="font-extrabold leading-none tracking-[-0.03em] text-white/[0.10] text-[20vw] sm:text-[18vw] lg:text-[15vw] whitespace-nowrap">
          NEPEX CARGO
        </span>
      </div>

      <div className="relative container-content pt-16 lg:pt-20 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1.1fr_1fr] gap-10 lg:gap-12 pb-10 lg:pb-12 border-b border-white/15">
          {/* Brand column */}
          <div className="max-w-md">
            <div className="flex items-center gap-4">
              <Image
                src="/9th-anniversary-badge.png"
                alt="9 years in business"
                width={62}
                height={55}
                className="h-12 w-auto shrink-0"
              />
              <Logo />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-white/85 max-w-xs">
              Delivering excellence across borders with precision and speed.
              Your trusted global logistics partner.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[18px] font-bold text-white mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[15px] text-white/80 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social column */}
          <div>
            <h4 className="text-[18px] font-bold text-white mb-5">
              Social Handles
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                >
                  {s.render()}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[13px] text-white/80">
          <span>© 2024 Nepex Cargo. A Nepsters Group Company.</span>
          <div className="flex gap-7">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for the watermark below */}
      <div aria-hidden="true" className="h-[10vw] sm:h-[8vw] lg:h-[6vw]" />
    </footer>
  );
}
