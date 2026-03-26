import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DownloadCTA } from "@/components/landing/DownloadCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
