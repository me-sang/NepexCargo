import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SetNewPasswordForm } from "@/components/sections/SetNewPasswordForm";

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <SetNewPasswordForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
