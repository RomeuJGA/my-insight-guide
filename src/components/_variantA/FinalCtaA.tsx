import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

const FinalCtaA = () => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const hasCredits = !!user && typeof credits === "number" && credits > 0;

  return (
    <section className="py-24 md:py-32 ab-a-hero relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[hsl(158_40%_55%/0.18)] blur-3xl" />
      </div>
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-balance mb-6 leading-[1.05]">
            Pronto para ver com mais <span className="italic text-[hsl(165_35%_28%)]">clareza</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Pause. Respire. Escolha um número.
          </p>
          <Link
            to={hasCredits ? "/#preview" : "/credits?buy=1"}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] font-medium shadow-elegant hover:shadow-glow transition-smooth"
          >
            Escolher o meu número
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaA;
