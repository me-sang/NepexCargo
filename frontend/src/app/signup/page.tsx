import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignupCard } from "@/components/sections/SignupCard";
import { redirectIfAuthed } from "@/lib/redirect-if-authed";

export default async function SignupPage() {
  await redirectIfAuthed();
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <SignupCard />
        </div>
      </main>
      <Footer />
    </>
  );
}
