import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ExperiencePreview from "@/components/ExperiencePreview";
import DailyMessage from "@/components/DailyMessage";
import ValueProps from "@/components/ValueProps";
import Experience from "@/components/Experience";
import Pricing from "@/components/Pricing";
import Trust from "@/components/Trust";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <ExperiencePreview />
      <DailyMessage />
      <ValueProps />
      <Experience />
      <Pricing />
      <Trust />
      <FinalCta />
      <Footer />
    </main>
  );
};

export default Index;
