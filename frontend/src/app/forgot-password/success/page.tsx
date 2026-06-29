import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PasswordResetSuccess } from "@/components/sections/PasswordResetSuccess";
import { redirectIfAuthed } from "@/lib/redirect-if-authed";

export default async function PasswordResetSuccessPage() {
  await redirectIfAuthed();
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <PasswordResetSuccess />
        </div>
      </main>
      <Footer />
    </>
  );
}
