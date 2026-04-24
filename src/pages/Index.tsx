import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Authority from "@/components/Authority";
import HowItWorks from "@/components/HowItWorks";
import RealExamples from "@/components/RealExamples";
import ExperiencePreview from "@/components/ExperiencePreview";
import DailyMessage from "@/components/DailyMessage";
import Experience from "@/components/Experience";
import FreeVsPaid from "@/components/FreeVsPaid";
import BookProgression from "@/components/BookProgression";
import Pricing from "@/components/Pricing";
import Trust from "@/components/Trust";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

import HeroA from "@/components/_variantA/HeroA";
import AuthorityA from "@/components/_variantA/AuthorityA";
import HowItWorksA from "@/components/_variantA/HowItWorksA";
import ExperiencePreviewA from "@/components/_variantA/ExperiencePreviewA";
import FreeVsPaidA from "@/components/_variantA/FreeVsPaidA";
import BookProgressionA from "@/components/_variantA/BookProgressionA";
import PricingA from "@/components/_variantA/PricingA";
import FinalCtaA from "@/components/_variantA/FinalCtaA";

import { useTrackOnce } from "@/hooks/useAnalytics";
import { useABVariant } from "@/hooks/useABVariant";

const Index = () => {
  const variant = useABVariant();
  useTrackOnce("landing_view");

  // Optional: tag the document so it's easy to verify variant in DevTools
  useEffect(() => {
    if (variant) document.documentElement.dataset.abVariant = variant;
  }, [variant]);

  // Wait for variant assignment to avoid layout flash
  if (!variant) {
    return <main className="min-h-screen bg-background" />;
  }

  if (variant === "a") {
    return (
      <main className="min-h-screen bg-background" data-ab-variant="a">
        <Navbar />
        <HeroA />
        <AuthorityA />
        <HowItWorksA />
        <RealExamples />
        <ExperiencePreviewA />
        <DailyMessage />
        <Experience />
        <FreeVsPaidA />
        <BookProgressionA />
        <PricingA />
        <Trust />
        <FinalCtaA />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background" data-ab-variant="b">
      <Navbar />
      <Hero />
      <Authority />
      <HowItWorks />
      <RealExamples />
      <ExperiencePreview />
      <DailyMessage />
      <Experience />
      <FreeVsPaid />
      <BookProgression />
      <Pricing />
      <Trust />
      <FinalCta />
      <Footer />
    </main>
  );
};

export default Index;
