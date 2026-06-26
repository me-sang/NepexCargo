import { Navbar } from "@/components/layout/Navbar";
import { ServicesHeroSection } from "@/components/sections/ServicesHeroSection";
import { ServicesGridSection } from "@/components/sections/ServicesGridSection";
import { DomesticServicesSection } from "@/components/sections/DomesticServicesSection";
import { InternationalServicesSection } from "@/components/sections/InternationalServicesSection";
import { VadServicesSection } from "@/components/sections/VadServicesSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServicesHeroSection />
        <ServicesGridSection />
        <DomesticServicesSection />
        <InternationalServicesSection />
        <VadServicesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
