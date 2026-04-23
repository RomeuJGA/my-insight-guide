import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-gradient-hero">
      {/* Soft animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary-glow/20 blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-20 w-[28rem] h-[28rem] rounded-full bg-accent/40 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/60 text-xs text-muted-foreground mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-shimmer" />
            564 mensagens · 5+ anos de existência
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance mb-6 animate-fade-in-up">
            Precisa de clareza?
            <br />
            <span className="italic text-primary">Receba uma orientação</span>
            <br />
            no momento certo.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            Escolha um número entre 1 e 564 e receba uma mensagem que pode ajudá-lo a refletir e a tomar decisões com mais consciência.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#experience"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium shadow-elegant hover:shadow-glow transition-smooth"
            >
              Receber a minha mensagem
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card/50 backdrop-blur hover:bg-card transition-smooth text-foreground font-medium"
            >
              Como funciona
            </a>
          </div>

          <p className="mt-8 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Ferramenta de reflexão pessoal · Não substitui aconselhamento profissional
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
