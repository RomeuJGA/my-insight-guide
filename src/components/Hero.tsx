import { ArrowRight } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const Hero = () => {
  const { track } = useAnalytics();
  return (
    <section className="relative pt-36 pb-28 md:pt-48 md:pb-36 overflow-hidden bg-gradient-hero bg-noise">
      {/* Subtle ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[32rem] h-[32rem] rounded-full bg-accent/[0.07] blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-32 w-[36rem] h-[36rem] rounded-full bg-primary/[0.04] blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-xs text-muted-foreground mb-10 animate-fade-in shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-shimmer" />
            Ver com mais clareza por dentro
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance mb-10 animate-fade-in-up">
            Nem tudo o que evita pensar…
            <br />
            <span className="italic text-accent">é por acaso.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed text-balance animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            Baseado no trabalho real de Mónyca Dell Rey, que acompanha diariamente processos de mudança profunda.
          </p>
          <p className="text-base md:text-lg text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed text-balance animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Escolha um número e receba uma mensagem que pode ajudá-lo a ver com mais clareza aquilo que tem evitado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#experience"
              onClick={() => track("click_receive_message", { metadata: { source: "hero" } })}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-medium shadow-elegant hover:shadow-glow hover:-translate-y-0.5 transition-smooth"
            >
              Receber uma mensagem
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-border bg-card/60 backdrop-blur-md hover:bg-card hover:border-accent/30 transition-smooth text-foreground font-medium"
            >
              Como funciona
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Algumas mensagens podem ser diretas ou desafiantes. O objetivo não é agradar, mas ajudar a ver com honestidade.
          </p>

          <p className="mt-10 text-xs italic text-muted-foreground/80 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            Baseado no livro <span className="text-foreground/70">"Eu Sei o que Estás a Pensar"</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
