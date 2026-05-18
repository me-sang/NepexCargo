"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

const shippingTypes = [
  {
    id: "international",
    label: "International",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="white" />
        <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" fill="white" opacity="0.7"/>
      </svg>
    ),
    bgImage: "linear-gradient(135deg, #1a9bb8 0%, #0d6e87 100%)",
  },
  {
    id: "domestic",
    label: "Domestic",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    ),
    bgImage: "linear-gradient(135deg, #2cb4d7 0%, #1a9bb8 100%)",
  },
  {
    id: "local",
    label: "Local",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-7h-2V8h2v2z"/>
        <circle cx="20" cy="16" r="2" fill="white"/>
      </svg>
    ),
    bgImage: "linear-gradient(135deg, #37c5e5 0%, #2CB4D7 100%)",
  },
];

export function HeroSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeType, setActiveType] = useState("international");

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a3a4a 40%, #0f2537 100%)",
        }}
      >
        {/* Decorative overlay dots */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #2CB4D7 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar transparent />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
          <div className="max-w-2xl mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Move anything,
              <br />
              <span className="text-[#2CB4D7]">anywhere</span> it matters.
            </h1>
          </div>

          {/* Shipping card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl">
            {/* Shipping types */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {shippingTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`
                    flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 cursor-pointer
                    ${activeType === type.id ? "ring-2 ring-[#2CB4D7] ring-offset-2" : "opacity-80 hover:opacity-100"}
                  `}
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ background: type.bgImage }}
                  >
                    {type.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#1B2B3B]">{type.label}</span>
                </button>
              ))}

              {/* Get an Estimate box */}
              <button className="flex flex-col items-center justify-center gap-2 rounded-xl p-3 bg-[#2CB4D7] text-white cursor-pointer hover:bg-[#1A9BB8] transition-colors">
                <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-center leading-tight">
                  Get an<br />Estimate
                </span>
                <span className="text-[10px] text-white/75">(takes ~2 mins)</span>
              </button>
            </div>

            {/* Tracking input */}
            <div className="flex items-center gap-2 border-2 border-[#E5E7EB] rounded-xl px-4 py-1 focus-within:border-[#2CB4D7] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB4D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="flex-1 py-3 text-sm text-[#374151] placeholder-[#9CA3AF] outline-none bg-transparent"
              />
              <Button variant="primary" size="sm" className="shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Track Shipment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L1440 60L1440 20C1200 60 720 0 0 40L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
