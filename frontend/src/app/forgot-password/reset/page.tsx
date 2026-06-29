import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SetNewPasswordForm } from "@/components/sections/SetNewPasswordForm";
import { redirectIfAuthed } from "@/lib/redirect-if-authed";

export default async function ResetPasswordPage() {
  await redirectIfAuthed();
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
