import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ArticlesSection } from "@/components/sections/ArticlesSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUsSection />
        <StatsSection />
        <HowItWorksSection />
        <PartnersSection />
        <IndustriesSection />
        <TestimonialsSection />
        <ArticlesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
