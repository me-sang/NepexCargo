import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignupCard } from "@/components/sections/SignupCard";

export default function SignupPage() {
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
