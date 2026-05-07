import { ArrowRight } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Variant A — Hero
 * Calmer, gentler tone. Sage palette via local accent classes.
 * Keeps brand name "Intus".
 */
const HeroA = () => {
  const { track } = useAnalytics();
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden ab-a-hero">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[hsl(158_40%_55%/0.18)] blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-20 w-[28rem] h-[28rem] rounded-full bg-[hsl(38_55%_88%/0.4)] blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/60 text-xs text-muted-foreground mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(165_35%_28%)] animate-shimmer" />
            Ferramenta de reflexão · Baseada em prática terapêutica real
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-balance mb-8 animate-fade-in-up">
            Nem todas as respostas
            <br />
            são fáceis de ouvir.
            <br />
            <span className="italic text-[hsl(165_35%_28%)]">Mas são, muitas vezes,</span>
            <br />
            <span className="italic text-[hsl(165_35%_28%)]">as que mais precisa.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed text-balance animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            Baseado no trabalho real de Mónica Dell Rey, que acompanha diariamente pessoas em processos de mudança profunda.
          </p>
          <p className="text-base md:text-lg text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed text-balance animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Escolha um número entre 1 e 534 e receba uma mensagem que pode ajudá-lo a ver com mais clareza aquilo que tem evitado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#experience"
              onClick={() => track("click_receive_message", { metadata: { source: "hero" } })}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] font-medium shadow-elegant hover:shadow-glow transition-smooth"
            >
              Receber uma mensagem
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card/50 backdrop-blur hover:bg-card transition-smooth text-foreground font-medium"
            >
              Como funciona
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Algumas mensagens podem ser diretas ou desafiantes. O objetivo não é agradar, mas ajudar a ver com honestidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroA;
