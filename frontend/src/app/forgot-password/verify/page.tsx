import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OtpForm } from "@/components/sections/OtpForm";

export default function VerifyOtpPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <OtpForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
