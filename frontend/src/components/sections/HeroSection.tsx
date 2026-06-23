"use client";

import { useState } from "react";

const shippingTypes = [
  {
    id: "international",
    label: "International",
    /* swap: <Image src="/images/shipping-international.jpg" alt="International" fill className="object-cover" /> */
    placeholder: "linear-gradient(160deg, #1a4060 0%, #0d6e87 100%)",
  },
  {
    id: "domestic",
    label: "Domestic",
    /* swap: <Image src="/images/shipping-domestic.jpg" alt="Domestic" fill className="object-cover" /> */
    placeholder: "linear-gradient(160deg, #8c6a1a 0%, #c49528 100%)",
  },
  {
    id: "local",
    label: "Local",
    /* swap: <Image src="/images/shipping-local.jpg" alt="Local" fill className="object-cover" /> */
    placeholder: "linear-gradient(160deg, #1c3a5a 0%, #2a5280 100%)",
  },
];

export function HeroSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeType, setActiveType] = useState("international");
  const [activeDot, setActiveDot] = useState(1);

  return (
    <section className="relative min-h-[calc(100vh-62px)] flex flex-col justify-center">
      {/* Background — swap with <Image src="/images/hero-bg.jpg" ... /> */}
      <div className="absolute inset-0 z-0 bg-[#1a2e3d]" />

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-[1.15] mb-8">
          Move anything, anywhere it matters.
        </h1>

        {/* Booking card */}
        <div className="w-full max-w-[760px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Shipping type tiles */}
          <div className="flex gap-3 p-4 pb-0">
            {shippingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex-1 ${
                  activeType === type.id
                    ? "ring-2 ring-primary ring-offset-1"
                    : "hover:ring-1 hover:ring-primary/30"
                }`}
              >
                {/* Image area */}
                <div
                  className="h-[130px] w-full relative overflow-hidden"
                  style={{ background: type.placeholder }}
                />
                {/* Label */}
                <div className="bg-white py-2 text-center">
                  <span className="text-xs font-semibold text-dark">{type.label}</span>
                </div>
              </button>
            ))}

            {/* Get an Estimate */}
            <button className="flex flex-col justify-between rounded-xl bg-primary text-white cursor-pointer hover:bg-primary-dark transition-colors group flex-1 p-4 min-h-[162px]">
              <div>
                <p className="text-sm font-bold leading-snug">Get an Estimate</p>
                <p className="text-[11px] text-white/70 mt-1">(takes ~2 mins)</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Tracking row */}
          <div className="p-4 pt-3">
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number (e.g. LP-987234)"
                className="flex-1 text-sm text-dark placeholder:text-[#9CA3AF] outline-none bg-transparent"
              />
              <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Track Shipment
              </button>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-2.5 mt-8">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setActiveDot(i)}
              className={`rounded-full transition-all duration-300 ${
                activeDot === i ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
