import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Uso como momento de pausa antes de decisões importantes. Ajuda-me a abrandar e a olhar para a situação com mais calma.",
    author: "Mariana S.",
    role: "Lisboa",
  },
  {
    quote: "Nem sempre concordo com a mensagem que recebo — mas faz-me pensar. E é precisamente esse o valor.",
    author: "André P.",
    role: "Porto",
  },
  {
    quote: "Tenho o livro físico há anos. Ter agora a versão digital tornou-se um pequeno ritual diário.",
    author: "Inês R.",
    role: "Coimbra",
  },
];

const Trust = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Confiança</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance">
            Histórias de quem já experimentou
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure key={t.author} className="p-8 rounded-3xl bg-card border border-border/60 shadow-soft flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="font-serif text-lg leading-relaxed text-foreground/90 flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border/60">
                <div className="font-medium text-sm">{t.author}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-16 p-6 rounded-2xl bg-muted/50 border border-border/60 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta ferramenta destina-se a reflexão pessoal e <strong className="text-foreground">não substitui aconselhamento profissional</strong> — psicológico, médico, jurídico ou financeiro.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Trust;
