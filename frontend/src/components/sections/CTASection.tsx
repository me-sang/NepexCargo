import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="bg-[#1B2B3B] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          Let&apos;s move your business forward
        </h2>
        <p className="text-base md:text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Fast, reliable, and customised logistics solutions at your fingertips. No commitments, no hidden fees.
        </p>
        <Button variant="white" size="lg" className="font-bold shadow-lg hover:shadow-xl">
          Get a Free Quote
        </Button>
      </div>
    </section>
  );
}
