import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginCard } from "@/components/sections/LoginCard";
import { redirectIfAuthed } from "@/lib/redirect-if-authed";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  await redirectIfAuthed(callbackUrl);
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
