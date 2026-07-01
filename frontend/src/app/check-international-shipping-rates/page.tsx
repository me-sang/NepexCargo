import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { QuoteHeroSection } from "@/components/sections/QuoteHeroSection";
import { RateResultsSection } from "@/components/sections/RateResultsSection";
import { InternationalBenefitsSection } from "@/components/sections/InternationalBenefitsSection";
import { QuoteJourneySection } from "@/components/sections/QuoteJourneySection";
import { CourierNetworkSection } from "@/components/sections/CourierNetworkSection";
import { OtherServicesSection } from "@/components/sections/OtherServicesSection";
import { CTASection } from "@/components/sections/CTASection";

export default function CheckInternationalShippingRatesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* QuoteHeroSection + RateResultsSection both read URL params and
            must be suspended together in Next 16's App Router. */}
        <Suspense fallback={null}>
          <QuoteHeroSection />
          <RateResultsSection />
        </Suspense>
        <InternationalBenefitsSection />
        <QuoteJourneySection />
        <CourierNetworkSection />
        <OtherServicesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
