import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginCard } from "@/components/sections/LoginCard";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white py-12 lg:py-20">
        <div className="container-content">
          <LoginCard />
        </div>
      </main>
      <Footer />
    </>
  );
}
