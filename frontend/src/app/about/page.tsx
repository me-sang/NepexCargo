import { Navbar } from "@/components/layout/Navbar";
import { AboutHeroSection } from "@/components/sections/AboutHeroSection";
import { AboutIntroSection } from "@/components/sections/AboutIntroSection";
import { OurObjectivesSection } from "@/components/sections/OurObjectivesSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHeroSection />
        <AboutIntroSection />
        <OurObjectivesSection />
        <WhyChooseUsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
