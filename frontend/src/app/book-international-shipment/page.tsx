import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingWizard } from "@/components/sections/booking/BookingWizard";

export default function BookInternationalShipmentPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[var(--color-surface)] min-h-screen">
        <Suspense fallback={null}>
          <BookingWizard />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
