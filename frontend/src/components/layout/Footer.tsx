import { Logo } from "@/components/ui/Logo";

const companyLinks = ["About", "Franchise", "Articles"];
const serviceLinks = ["International", "Domestic", "Local"];
const supportLinks = ["Track a Shipment", "Get a Quote", "Contact", "FAQs"];

export function Footer() {
  return (
    <footer className="bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
        {/* Main columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-white/20">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* 9+ years emblem */}
              <div className="relative shrink-0">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="24" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
                  <circle cx="26" cy="26" r="19" stroke="white" strokeWidth="1" opacity="0.4" />
                  {/* Laurel lines */}
                  <path d="M10 36 Q14 30 10 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <path d="M42 36 Q38 30 42 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  {/* 9+ text */}
                  <text x="26" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="system-ui">9+</text>
                  <text x="26" y="35" textAnchor="middle" fill="white" fontSize="6" fontWeight="500" fontFamily="system-ui" opacity="0.8">YEARS</text>
                </svg>
              </div>
              <Logo variant="light" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Delivering excellence across borders with precision and speed.
              Your trusted global logistics partner.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold tracking-wide text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold tracking-wide text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Social */}
          <div>
            <h4 className="text-sm font-bold tracking-wide text-white mb-4">Support</h4>
            <ul className="space-y-3 mb-8">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-bold tracking-wide text-white mb-4">Social Handles</h4>
            <div className="flex gap-2.5">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="#" aria-label="X / Twitter" className="w-9 h-9 rounded-full flex items-center justify-center bg-black hover:opacity-90 transition-opacity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="#" aria-label="WhatsApp" className="w-9 h-9 rounded-full flex items-center justify-center bg-[#25D366] hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/60">
          <span>© 2024 Nepex Cargo. A Nepsters Group Company.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>

      {/* NEPEX CARGO watermark */}
      <div className="overflow-hidden select-none pointer-events-none" aria-hidden="true">
        <p
          className="text-center font-extrabold text-white/10 whitespace-nowrap leading-none pb-2"
          style={{ fontSize: "clamp(56px, 11vw, 148px)", letterSpacing: "-0.02em" }}
        >
          NEPEX CARGO
        </p>
      </div>
    </footer>
  );
}
