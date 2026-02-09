import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { StatsBar } from "@/components/landing/StatsBar";
import { PopularStocks } from "@/components/landing/PopularStocks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-bg-primary">
      <Navbar />
      <Hero />
      <MarketTicker />
      <StatsBar />
      <FeaturesGrid />
      <PopularStocks />
      <CTA />
      <Footer />
    </div>
  );
}
