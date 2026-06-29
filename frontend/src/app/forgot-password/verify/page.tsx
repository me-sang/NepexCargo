import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OtpForm } from "@/components/sections/OtpForm";
import { redirectIfAuthed } from "@/lib/redirect-if-authed";

export default async function VerifyOtpPage() {
  await redirectIfAuthed();
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
