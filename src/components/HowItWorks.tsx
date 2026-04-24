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
    <section id="how" className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Como funciona</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance">
            Três passos simples para uma nova perspetiva
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative p-8 rounded-3xl bg-gradient-card border border-border/60 shadow-soft hover:shadow-elegant transition-smooth group"
            >
              <div className="absolute top-6 right-6 font-serif text-5xl text-muted/60 group-hover:text-primary/20 transition-smooth">
                0{i + 1}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-smooth">
                <step.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-2xl mb-3 leading-snug">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center font-serif italic text-lg text-muted-foreground mt-12">
          Não é uma resposta direta. É um espelho.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
