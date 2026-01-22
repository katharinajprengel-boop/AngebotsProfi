import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { QuoteGenerator } from "@/components/QuoteGenerator";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <QuoteGenerator />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
