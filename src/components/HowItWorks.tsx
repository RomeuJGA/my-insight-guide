import { Brain, Hash, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Pense numa situação da sua vida",
    description: "Centre-se naquilo que está a viver, a evitar ou a tentar compreender.",
  },
  {
    icon: Hash,
    title: "Escolha um número",
    description: "Confie na sua intuição. Não existe escolha certa ou errada.",
  },
  {
    icon: Sparkles,
    title: "Receba uma mensagem",
    description: "Leia com calma. Deixe-a assentar antes de tirar conclusões.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="relative py-28 md:py-36 bg-gradient-section overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs font-medium text-accent mb-4 uppercase tracking-[0.18em]">Como funciona</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance leading-[1.1]">
            Três passos simples para uma nova perspetiva
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative p-9 rounded-3xl bg-gradient-card border border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth group overflow-hidden"
            >
              <div className="absolute top-7 right-7 font-serif text-5xl text-muted/50 group-hover:text-accent/25 transition-smooth">
                0{i + 1}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-7 group-hover:bg-accent/15 transition-smooth">
                <step.icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-2xl mb-3 leading-snug">{step.title}</h3>
              <p className="text-muted-foreground leading-[1.7]">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center font-serif italic text-lg text-muted-foreground mt-16">
          Não é uma resposta direta. É um espelho.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
