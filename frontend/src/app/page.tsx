import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Developers } from "@/components/landing/Developers";
import { UseCases } from "@/components/landing/UseCases";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Developers />
        <UseCases />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
