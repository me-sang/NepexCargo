const steps = [
  {
    number: "01",
    title: "Enter route",
    description: "Tell us where it's coming from and going to.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Route/map pin icon */}
        <circle cx="10" cy="10" r="4" fill="#EF4444" />
        <circle cx="10" cy="10" r="2" fill="white" />
        <circle cx="22" cy="22" r="4" fill="#3B82F6" />
        <circle cx="22" cy="22" r="2" fill="white" />
        <path d="M10 14 C10 18 14 18 16 20 C18 22 22 22 22 18" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3 2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Compare rates",
    description: "See live pricing across air, sea and road.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bar chart */}
        <rect x="4" y="18" width="6" height="10" rx="1.5" fill="#3B82F6" />
        <rect x="13" y="12" width="6" height="16" rx="1.5" fill="#F59E0B" />
        <rect x="22" y="6" width="6" height="22" rx="1.5" fill="#10B981" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Book & label",
    description: "Pay securely, print labels or schedule pickup.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Package box */}
        <path d="M4 10L16 4L28 10V22L16 28L4 22V10Z" fill="#F59E0B" />
        <path d="M4 10L16 16L28 10" stroke="#D97706" strokeWidth="1.5" fill="none" />
        <path d="M16 16V28" stroke="#D97706" strokeWidth="1.5" />
        <path d="M10 7L22 13" stroke="#FCD34D" strokeWidth="1" strokeDasharray="2 1" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Track & deliver",
    description: "Live updates from origin to destination.",
    icon: (
      <svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Truck + clock */}
        <rect x="2" y="10" width="20" height="14" rx="2" fill="#2CB4D7" />
        <rect x="22" y="14" width="10" height="10" rx="1.5" fill="#1a9bb8" />
        <rect x="24" y="16" width="6" height="4" fill="#d0eef8" rx="1" />
        <circle cx="8" cy="24" r="3" fill="#0D1B2A" stroke="#2CB4D7" strokeWidth="1.5" />
        <circle cx="8" cy="24" r="1.2" fill="#2CB4D7" />
        <circle cx="26" cy="24" r="2.5" fill="#0D1B2A" stroke="#1a9bb8" strokeWidth="1.5" />
        <circle cx="26" cy="24" r="1" fill="#1a9bb8" />
        {/* Clock */}
        <circle cx="29" cy="8" r="6" fill="white" stroke="#D1D5DB" strokeWidth="1" />
        <path d="M29 5v3l2 1.5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: heading (left) + truck image (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
            {/* Badge */}
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/20 text-white mb-5">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              From quote to doorstep in four steps
            </h2>
            <p className="text-white/75 text-sm md:text-base leading-relaxed">
              A simple, transparent flow built for individuals and businesses.
            </p>
          </div>

          {/* Truck image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Swap with: <Image src="/images/truck.png" alt="Cargo truck" width={560} height={320} className="object-contain" /> */}
            <div className="w-full max-w-[520px] aspect-video relative">
              <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                {/* Simplified large truck illustration */}
                <rect x="30" y="100" width="280" height="120" fill="white" rx="8" opacity="0.95"/>
                <rect x="310" y="120" width="150" height="100" fill="white" rx="8" opacity="0.95"/>
                <rect x="325" y="130" width="120" height="60" fill="#d0eef8" rx="4" />
                {/* Truck body detail lines */}
                <line x1="30" y1="140" x2="310" y2="140" stroke="#e0e0e0" strokeWidth="1"/>
                {/* Wheels */}
                <circle cx="90" cy="222" r="30" fill="#1B2B3B" stroke="white" strokeWidth="4" />
                <circle cx="90" cy="222" r="14" fill="#2CB4D7" opacity="0.5"/>
                <circle cx="220" cy="222" r="30" fill="#1B2B3B" stroke="white" strokeWidth="4" />
                <circle cx="220" cy="222" r="14" fill="#2CB4D7" opacity="0.5"/>
                <circle cx="390" cy="222" r="24" fill="#1B2B3B" stroke="white" strokeWidth="4" />
                <circle cx="390" cy="222" r="10" fill="#2CB4D7" opacity="0.5"/>
                {/* Headlights */}
                <rect x="450" y="140" width="20" height="12" fill="#FCD34D" rx="2"/>
                <rect x="450" y="175" width="20" height="8" fill="#EF4444" rx="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom: 4 step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="relative bg-white rounded-2xl p-6 overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/10 translate-x-6 -translate-y-6" />
              <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-primary/5 translate-x-2 -translate-y-2" />

              {/* Step number */}
              <p className="text-xl font-black text-primary/70 mb-4 relative z-10">{step.number}</p>

              {/* Icon */}
              <div className="mb-4 relative z-10">{step.icon}</div>

              {/* Text */}
              <h3 className="text-sm font-bold text-dark mb-1.5">{step.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
