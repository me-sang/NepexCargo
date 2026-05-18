import { Logo } from "@/components/ui/Logo";

const companyLinks = ["About", "Services", "Articles", "Contact"];
const serviceLinks = ["International", "Domestic", "Franchise", "Local"];
const supportLinks = ["Track a Shipment", "Get a Quote", "FAQs"];
const socialLinks = [
  { label: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
  { label: "Instagram", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a2 2 0 002-2v-11a2 2 0 00-2-2h-11a2 2 0 00-2 2v11a2 2 0 002 2z" },
  { label: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
];

export function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Delivering excellence across borders with precision and care.
              Your trusted global logistics partner.
            </p>
            <p className="mt-4 text-xs text-white/40">
              © 2024 Nepex Cargo. A Hyberlab Group Company.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/60 hover:text-[#2CB4D7] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/60 hover:text-[#2CB4D7] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Social */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white mb-4">Support</h4>
            <ul className="space-y-3 mb-8">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/60 hover:text-[#2CB4D7] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-bold tracking-wider text-white mb-4">Social Handles</h4>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#2CB4D7] flex items-center justify-center transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <span>© 2024 Nepex Cargo. A Hyberlab Group Company.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#2CB4D7] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#2CB4D7] transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
