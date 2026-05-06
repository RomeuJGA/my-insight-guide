import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Authority from "@/components/Authority";
import HowItWorks from "@/components/HowItWorks";
import RealExamples from "@/components/RealExamples";
import ExperiencePreview from "@/components/ExperiencePreview";
import DailyMessage from "@/components/DailyMessage";
import Experience from "@/components/Experience";
import FreeVsPaid from "@/components/FreeVsPaid";
import Pricing from "@/components/Pricing";
import Trust from "@/components/Trust";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

import { useTrackOnce } from "@/hooks/useAnalytics";
import { useABVariant } from "@/hooks/useABVariant";

// Variant A loaded lazily — only served to ~50% of users
const HeroA = lazy(() => import("@/components/_variantA/HeroA"));
const AuthorityA = lazy(() => import("@/components/_variantA/AuthorityA"));
const HowItWorksA = lazy(() => import("@/components/_variantA/HowItWorksA"));
const ExperiencePreviewA = lazy(() => import("@/components/_variantA/ExperiencePreviewA"));
const FreeVsPaidA = lazy(() => import("@/components/_variantA/FreeVsPaidA"));
const PricingA = lazy(() => import("@/components/_variantA/PricingA"));
const FinalCtaA = lazy(() => import("@/components/_variantA/FinalCtaA"));

const Index = () => {
  const variant = useABVariant();
  useTrackOnce("landing_view");

  useEffect(() => {
    if (variant) document.documentElement.dataset.abVariant = variant;
  }, [variant]);

  if (!variant) {
    return <main className="min-h-screen bg-background" />;
  }

  if (variant === "a") {
    return (
      <main className="min-h-screen bg-background" data-ab-variant="a">
        <Navbar />
        <Suspense>
          <HeroA />
          <AuthorityA />
          <HowItWorksA />
          <RealExamples />
          <ExperiencePreviewA />
          <DailyMessage />
          <Experience />
          <FreeVsPaidA />
          <PricingA />
          <Trust />
          <FinalCtaA />
        </Suspense>
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
      <Pricing />
      <Trust />
      <FinalCta />
      <Footer />
    </main>
  );
};

export default Index;
