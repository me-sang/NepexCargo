"use client";

import { useState } from "react";

type ShippingType = "international" | "domestic" | "local";

const shippingCards: {
  id: ShippingType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "international",
    label: "International",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M21 16l-8-4.5V6a1 1 0 00-2 0v5.5L3 16v1.5l8-2v3.5l-2 1.5v1l3-.8 3 .8v-1L13 19v-3.5l8 2V16z" />
      </svg>
    ),
  },
  {
    id: "domestic",
    label: "Domestic",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7.5" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
      </svg>
    ),
  },
  {
    id: "local",
    label: "Local",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="6" cy="17" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
        <path d="M6 17L10 9h4l4 8" />
        <path d="M11 9V6h2" />
        <path d="M14 5h3l1.5 2.5" />
      </svg>
    ),
  },
];

export function HeroSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeCard, setActiveCard] = useState<ShippingType>("international");
  const carouselSlides = 4;
  const [activeSlide, setActiveSlide] = useState(1);

  return (
    <section className="relative min-h-[720px] lg:min-h-[820px] flex flex-col overflow-hidden">
      {/* Photographic backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Refined overlay — preserves photo while seating headline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,36,43,0.20) 0%, rgba(9,36,43,0.05) 30%, rgba(9,36,43,0.40) 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center w-full container-content py-16 lg:py-20">
        {/* Headline */}
        <div className="max-w-4xl mx-auto text-center mb-12 lg:mb-14">
          <h1
            className="font-extrabold text-white leading-[1.05] tracking-[-0.025em] text-[2.25rem] sm:text-[2.875rem] lg:text-[3.5rem]"
            style={{ textShadow: "0 2px 32px rgba(9,36,43,0.45)" }}
          >
            Move anything, anywhere it matters.
          </h1>
        </div>

        {/* Quote widget */}
        <div className="max-w-2xl w-full mx-auto bg-white rounded-[20px] shadow-[var(--shadow-float)] p-5 sm:p-6">
          {/* Card row — 3 icon cards + 1 estimate card */}
          <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1.4fr] gap-3 mb-4">
            {shippingCards.map((card) => {
              const isActive = activeCard === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveCard(card.id)}
                  aria-pressed={isActive}
                  className="group flex flex-col items-center"
                >
                  <div
                    className={`
                      w-full max-w-[88px] aspect-square rounded-[12px] flex items-center justify-center
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-[var(--color-accent)] text-white shadow-[0_6px_18px_-6px_rgba(44,180,215,0.55)]"
                          : "bg-[#F1F6F8] text-[var(--color-brand)] group-hover:bg-[#E6F0F4]"
                      }
                    `}
                  >
                    {card.icon}
                  </div>
                  <span
                    className={`
                      mt-2.5 text-[13px] font-semibold leading-none transition-colors
                      ${isActive ? "text-[var(--color-text)]" : "text-[#56707A]"}
                    `}
                  >
                    {card.label}
                  </span>
                </button>
              );
            })}

            {/* Get an Estimate card */}
            <button
              type="button"
              className="col-span-2 sm:col-span-1 flex flex-col items-start justify-between rounded-[12px] p-4 bg-[var(--color-accent)] text-white text-left hover:bg-[var(--color-accent-hover)] transition-colors min-h-[112px]"
            >
              <div>
                <div className="text-[15px] font-bold leading-tight">
                  Get an Estimate
                </div>
                <div className="text-[11px] text-white/85 mt-0.5">
                  (takes ~2 mins)
                </div>
              </div>
              <span className="mt-2 w-8 h-8 rounded-full bg-white text-[var(--color-accent)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>

          {/* Tracking row */}
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/55 focus-within:border-[var(--color-accent)] transition-colors pl-4 pr-1.5 py-1.5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <path d="M3.27 6.96L12 12l8.73-5.04M12 22V12" />
              <circle cx="17" cy="6" r="3" fill="none" stroke="var(--color-accent)" />
              <path d="M16 6h2M17 5v2" stroke="var(--color-accent)" strokeWidth="1.2" />
            </svg>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter your tracking number (e.g. LP-987234)"
              className="flex-1 min-w-0 py-2 text-[14px] text-[var(--color-text)] placeholder:text-[#9CA3AF] outline-none bg-transparent"
            />
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-[13px] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7h11v8H3z" />
                <path d="M14 10h4l3 3v2h-7z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
              Track Shipment
            </button>
          </div>
        </div>

        {/* Carousel pagination */}
        <div
          className="flex items-center justify-center gap-2 mt-10"
          role="tablist"
          aria-label="Hero slides"
        >
          {Array.from({ length: carouselSlides }).map((_, i) => {
            const isActive = i === activeSlide;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActiveSlide(i)}
                className={`transition-all rounded-full ${
                  isActive
                    ? "w-7 h-1.5 bg-[var(--color-accent)]"
                    : "w-1.5 h-1.5 bg-white/65 hover:bg-white/85"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
