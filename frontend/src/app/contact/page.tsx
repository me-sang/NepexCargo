import { Navbar } from "@/components/layout/Navbar";
import { ContactHeroSection } from "@/components/sections/ContactHeroSection";
import { ContactInfoSection } from "@/components/sections/ContactInfoSection";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { Footer } from "@/components/layout/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactHeroSection />
        <ContactInfoSection />
        <ContactFormSection />
      </main>
      <Footer />
    </>
  );
}
