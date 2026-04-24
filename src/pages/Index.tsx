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
import { useTrackOnce } from "@/hooks/useAnalytics";

const Index = () => {
  useTrackOnce("landing_view");
  return (
    <main className="min-h-screen bg-background">
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
