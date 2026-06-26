import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
