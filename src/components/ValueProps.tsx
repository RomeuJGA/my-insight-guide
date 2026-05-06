import { BookOpen, Hash, Heart, Zap } from "lucide-react";

const values = [
  { icon: BookOpen, title: "5+ anos em formato físico", desc: "Uma ferramenta usada e testada há mais de cinco anos." },
  { icon: Hash, title: "534 mensagens únicas", desc: "Cada número guarda uma reflexão distinta e cuidadosamente escrita." },
  { icon: Heart, title: "Reflexão pessoal", desc: "Pensada para o ajudar a olhar para dentro com mais consciência." },
  { icon: Zap, title: "Simples e intuitiva", desc: "Sem rituais complicados. Pense, escolha, reflita." },
];

const ValueProps = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Por que Ponto Cego</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance">
            Uma ferramenta de reflexão construída com cuidado
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
