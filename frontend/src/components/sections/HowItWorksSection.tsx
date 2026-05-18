import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    number: "01",
    title: "Enter route",
    description: "Tell us where it's coming from and going to.",
  },
  {
    number: "02",
    title: "Compare rates",
    description: "See live pricing across air, sea and rail.",
  },
  {
    number: "03",
    title: "Book & label",
    description: "Pay securely, print labels or schedule pickup.",
  },
  {
    number: "04",
    title: "Track & deliver",
    description: "Live updates from origin to destination.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text content */}
          <div>
            <SectionHeader
              subtitle="HOW IT WORKS"
              title="From quote to doorstep in four steps"
              description="A simple, transparent flow built for individuals and businesses."
              align="left"
              className="mb-12"
            />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#2CB4D7] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px flex-1 mt-2 bg-[#E5E7EB] min-h-8" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="text-base font-bold text-[#1B2B3B] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: truck image placeholder */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#1B2B3B] to-[#0D3D5A] flex items-center justify-center">
              {/* Decorative truck illustration */}
              <div className="text-center">
                <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Road */}
                  <rect x="0" y="95" width="200" height="25" fill="#1a3344" rx="0"/>
                  <rect x="80" y="105" width="20" height="4" fill="#2CB4D7" rx="2"/>
                  <rect x="110" y="105" width="20" height="4" fill="#2CB4D7" rx="2"/>
                  {/* Truck body */}
                  <rect x="20" y="55" width="100" height="42" fill="#2CB4D7" rx="4"/>
                  {/* Cab */}
                  <rect x="120" y="65" width="50" height="32" fill="#1a9bb8" rx="4"/>
                  {/* Windshield */}
                  <rect x="130" y="70" width="30" height="18" fill="#e0f5fb" rx="2"/>
                  {/* Wheels */}
                  <circle cx="45" cy="97" r="12" fill="#0D1B2A" stroke="#2CB4D7" strokeWidth="3"/>
                  <circle cx="45" cy="97" r="5" fill="#2CB4D7"/>
                  <circle cx="90" cy="97" r="12" fill="#0D1B2A" stroke="#2CB4D7" strokeWidth="3"/>
                  <circle cx="90" cy="97" r="5" fill="#2CB4D7"/>
                  <circle cx="145" cy="97" r="10" fill="#0D1B2A" stroke="#1a9bb8" strokeWidth="3"/>
                  <circle cx="145" cy="97" r="4" fill="#1a9bb8"/>
                  {/* Speed lines */}
                  <line x1="0" y1="72" x2="18" y2="72" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="0" y1="80" x2="18" y2="80" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <line x1="0" y1="88" x2="15" y2="88" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
                </svg>
                <p className="text-[#2CB4D7] text-sm font-semibold mt-4 opacity-60">Fast & Reliable Delivery</p>
              </div>

              {/* Decorative badge */}
              <div className="absolute top-4 right-4 bg-[#2CB4D7] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                On-Time Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
